Ext.define('Transactions.module.TransactionComms', {});   // HACK to allow dependents to "require" this code

var TransactionComms = (function () {
    var me = {};

    me.syncSuccess = function (grid, y) {
        var rec = grid.store.getAt(y);
        rec.set('SyncState', 'Synced');
        rec.set('SyncErrorMessage', '');
    }

    me.syncInProgress = function(grid, y) {
        var rec = grid.store.getAt(y);
        rec.set('SyncState', 'Syncing');
    }

    me.syncError = function(grid, y, actionErrors) {
        var rec = grid.store.getAt(y);
        rec.set('SyncState', 'SyncError');          // Change icon
        rec.set('SyncErrorMessage', actionErrors);  // Was used by tooltip to show general errors - now use data-errorqtip on Status icon cell
    }

    me.getColumnIndexes = function(grid) {
        // Gets list dataIndex's for all columns in the grid
        // NOTE: all columns seem to have an editor, even columns with no editor:
        // NOTE2: findStatusColumnIndex() seems a simpler way to find column indexes - doesn't matter whether they're editable or not
        var columnIndexes = [];

        var getIndex = function(column) {
            if (Ext.isDefined(column.getEditor())) {
                columnIndexes.push(column.dataIndex);
            } else {
                columnIndexes.push(undefined);
            }
        }
        
        Ext.each(grid.columns, function(column) {
            // find columns with editor, with support for grouped headers
            if (column.isGroupHeader) {
                Ext.each(column.items.items, function(subcolumn) {
                    getIndex(subcolumn);
                }); 
            } else {
                getIndex(column);
            }
        });        
        return columnIndexes;       
    }

    me.displayServerSideInputErrors = function (grid, ssErrors, y) {
        //NRCommon.DebugLog("ssErrors: " + ssErrors);
        // Expects ssErrors = "[['FieldName1', ['field1 error 1']],['FieldName2', ['field2 error 1', 'field2 error 2']]]" etc...

        var view, columnIndexes;
        ssErrors = eval(ssErrors); // HACK: use eval to parse string to array
        columnIndexes = me.getColumnIndexes(grid);
        view = grid.getView();

        /* Use Ext.data.Model validation i.e. from grid.store.records
        errors = record.validate();
        if (errors.isValid()) {
            return true;
        }
        */
        // field = column. NB not all model.fields may be used as a column, may be different order too.
        // Build map[fieldName] -> server-side error array
        var map = new Map;
        for (var i = 0; i<ssErrors.length; ++i) {
            map.put(ssErrors[i][0], ssErrors[i][1]);
        }

        // Apply invalid css formatting to cells in row which match this field
        // NB goes through each field in the row
        Ext.each(columnIndexes, function (columnIndex, x) {
            var cellErrors, cell, messages;
            if (columnIndex === undefined) {
                return; // NOTE: return = continue, inside Ext.each
            }

            cellErrors = map.get(columnIndex);
            if (!Ext.isEmpty(cellErrors)) {
                //NRCommon.DebugLog("x: " + x + "; y:" + y);
                cell = view.getCellByPosition({ row: y, column: x });
                messages = '';
                //debugger;
                Ext.each(cellErrors, function (cellError) {
                    messages += Ext.String.format('<li>{0}</li>', cellError);
                });

                // red underline
                cell.addCls("x-form-invalid-field");
                // error tooltip
                cell.set({'data-errorqtip': Ext.String.format('<ul>{0}</ul>', messages)});
            }
        });
        /* get row - how to apply field errors
        var e = from.getActiveErrors();   // Preserve any pre-existing errors
        e.push('From date must precede To date');
        from.markInvalid(e);
        */
    }

    me.findStatusColumnIndex = function (grid) {
        // NOTE: even works when user manually re-arranges "Status" column order
        var statusColumn = -1;
        for (var i = 0; i < grid.columns.length; ++i) {
            if (grid.columns[i].text === "Status") {
                statusColumn = i;
                break;
            }
        }
        return statusColumn;
    }

    me.displayServerSideGeneralErrors = function (grid, actionError, y) {
        //NRCommon.DebugLog("actionError: " + actionError);
        // Expects actionError = "single string error" - see CashController & TradeController.Result

        var statusColumn = me.findStatusColumnIndex(grid);
        if (statusColumn === -1) {
            NRCommon.DebugLog("Can't set actionError: can't find Status column");
            return;
        }

        // Apply invalid css formatting & error qtip to status cell
        var cell = grid.getView().getCellByPosition({ row: y, column: statusColumn });
        cell.addCls("x-form-invalid-field");    // red underline
        cell.set({ 'data-errorqtip': actionError });    // error tooltip
    }

    me.handleServerSideException = function (grid, response) {
        if (response.timedout) {
            Ext.MessageBox.show({
                title: 'Warning',
                msg: 'The update may have succeeded however the server took too long to respond.<br/><br/>In order to preserve synchronisation with the server this page will now be reloaded. We apologise for the inconvenience.',
                icon: Ext.MessageBox.WARNING,
                buttons: Ext.Msg.OK,
                fn: ReloadPage
            });
        } else {
            var result = jQuery.parseJSON(response.responseText);
            if (result.csrf) {
                Ext.MessageBox.show({
                    title: 'Error',
                    msg: 'The update failed. You have lost synchronisation with the server - did you open the transactions screen in another browser window?<br/><br/>In order to re-establish synchronisation with the server this page will now be reloaded. We apologise for the inconvenience.',
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    fn: ReloadPage
                });
                return;
            } else {
                Ext.MessageBox.show({
                    title: 'Error',
                    msg: Ext.String.format('An unexpected error occurred with your last update:<br/>{0}<br/><br/>In order to preserve synchronisation with the server this page will now be reloaded. We apologise for the inconvenience.', result.message),
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    fn: ReloadPage
                });
            }
        }
    }

    me.handleServerResponse = function (grid, operation, transactionName) {
        // Handles 3 types of trade & cash update responses:
        //  1. Success
        //  2. Failure:
        //      2.1 Field-specific input error
        //      2.2 or an action error
        //  NOTE: Action will not have been performed server-side if there were input errors

        /* 
        NOTE: response.responseText is a string which contains JSON
        Example test 1: Field-specfic input error
            var responseJSON = {
                "success":true,
                "status":1, // see C:\netreturn.co.za\NetReturn\NetReturn\Models\Output\BaseVM.cs : ResponseTypeFlags
                "message":"Updated failed",
                "validationErrors": [ ['Amount', ['Mousover error for Amount', 'Error 2']] ],
                "actionErrors": null,
                "data": {
                    "ID":42,
                    "Date":"2012-09-04T00:00:00",
                    "Type":"WITHDRAWAL",
                    "Amount":43
                }
            };
            TransactionComms.handleServerResponse(Ext.getCmp('Grid_Cash'), JSON.stringify(responseJSON));

            // Format of "validationErrors":
            //      "[['FieldName1', ['field1 error 1']], ['FieldName2', ['field2 error 1', 'field2 error 2']], ... etc ...]"


        Example test 2: Action error
            var responseJSON = {
                "success":true,
                "status":4, // see C:\netreturn.co.za\NetReturn\NetReturn\Models\Output\BaseVM.cs : ResponseTypeFlags
                "message":"Updated failed",
                "validationErrors": [],
                "actionErrors": "Test action error",
                "data": TradeGridExt.store.data.items[0].data
            };
            TransactionComms.handleServerResponse(Ext.getCmp('Grid_Trades'), JSON.stringify(responseJSON));
        */

        if (operation.action == 'create') {
            return;     // nothing to do here
        }
        if (operation.response === undefined) {
            return;
        }

        var record = operation.getRecords()[0],
            response = operation.response,
            name = Ext.String.capitalize(operation.action),
            id = record.getId(),
            verb,
            result = jQuery.parseJSON(response.responseText),   // responseText -> js object
            y;

        //
        // 1. Success
        //
        if (result.status === Base.ResponseType.Success.value) {
            // name = Update, Create, Destroy
            if (name == 'Create' && id == 0) {
                return;
            }
            if (name == 'Destroy') {
                verb = 'Deleted';
            } else {
                verb = name + 'd';

                var y = grid.store.findExact('ID', id);
                if (y != -1) {
                    TransactionComms.syncSuccess(grid, y);
                }
            }

            Popup.Message(name, Ext.String.format("{0} {1}: {2}", verb, transactionName, record.getId()), 3000);

        } else {
            //
            // 2. Failure
            //
            y = grid.store.findExact('ID', result.data.ID);

            if (result.status & (Base.ResponseType.Error_Input.value | Base.ResponseType.Error_Input_ServerSide.value)) {
                //
                // 2.1 Field-specific input error
                //

                // .validationErrors -> client-side field errors
                if (y != -1) {
                    me.syncError(grid, y, '');
                    me.displayServerSideInputErrors(grid, result.validationErrors, y); // NOTE: call this after syncError() otherwise <td> stylings will be lost
                }
                Ext.MessageBox.show({
                    title: 'Error',
                    msg: 'Your update failed. There were errors with your inputs. Errors will be visible when you dismiss this dialog box',
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK
                });
            } else if (result.status & Base.ResponseType.Error_General.value) {
                //
                // 2.2 Action error
                //

                // Store result.actionErrors - will be displayed by tooltip on hover over row - see Ext.tip.ToolTip below
                if (y != -1) {
                    me.syncError(grid, y, result.actionErrors);
                    me.displayServerSideGeneralErrors(grid, result.actionErrors, y);
                }

                Ext.MessageBox.show({
                    title: 'Error',
                    msg: 'Your update failed. The following error occurred whilst processing the update:<br/><br/>' + result.actionErrors,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK
                });
            }
        }
    }

    return me;
}());

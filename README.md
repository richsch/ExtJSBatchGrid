ExtJSBatchGrid
==============

A POC for batching operations across stores in Ext.JS.

Concept being that there are two grids with two separate stores - their sync operations 
are batched, across BOTH grids. ie. A single batch operation will sync data for both stores.

REST functionality provided by WebAPI controllers.
DrinkController - handles the DrinkStore directly
SportController - handles the SportStore directly
BatchController - will handle operations for all stores

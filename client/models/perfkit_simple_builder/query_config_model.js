/**
 * @copyright Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @fileoverview Model definition for a BigQuery query against Perfkit samples
 * data.
 * @author joemu@google.com (Joe Allan Muharsky)
 */

goog.provide('p3rf.perfkit.explorer.models.perfkit_simple_builder.QueryConfigModel');

goog.require('p3rf.perfkit.explorer.models.perfkit_simple_builder.DateFilter');
goog.require('p3rf.perfkit.explorer.models.perfkit_simple_builder.DateFilterType');
goog.require('p3rf.perfkit.explorer.models.perfkit_simple_builder.MeasureResult');
goog.require('p3rf.perfkit.explorer.models.perfkit_simple_builder.QueryColumnModel');
goog.require('p3rf.perfkit.explorer.models.perfkit_simple_builder.QueryDateGroupings');
goog.require('p3rf.perfkit.explorer.models.perfkit_simple_builder.QueryFilterModel');
goog.require('p3rf.perfkit.explorer.models.perfkit_simple_builder.QueryFilterModel');


goog.scope(function() {

var explorer = p3rf.perfkit.explorer;
var DateFilter = p3rf.perfkit.explorer.models.perfkit_simple_builder.DateFilter;
var DateFilterType = p3rf.perfkit.explorer.models.perfkit_simple_builder.DateFilterType;
var MeasureResult = p3rf.perfkit.explorer.models.perfkit_simple_builder.MeasureResult;
var QueryColumnModel = p3rf.perfkit.explorer.models.perfkit_simple_builder.QueryColumnModel;
var QueryDateGroupings = p3rf.perfkit.explorer.models.perfkit_simple_builder.QueryDateGroupings;
var QueryFilterModel = p3rf.perfkit.explorer.models.perfkit_simple_builder.QueryFilterModel;


/**
 * The default measure for new widgets.
 * @type {!string}
 */
var DEFAULT_MEASURE = '99%';

/**
 * The default max # of rows returned for new widgets.
 * @type {!number}
 */
var DEFAULT_ROW_LIMIT = 100;


/**
 * QueryConfigModel describes a query semantically; The filters and results sections are largely used to generate
 * on-the-fly SQL statements, though additional functionality like pivots is contained here as well.  This object
 * is serialized to JSON and passed to a service (such as /data/sql) to retrieve data.
 * @constructor
 * @implements {IQueryConfigModel}
 *
 */
explorer.models.perfkit_simple_builder.QueryConfigModel = function() {
  /**
   * filters provide properties and metadata to restrict the results of data in a generated SQL statement.
   * @type {!QueryFilterModel}
   */
  this.filters = new QueryFilterModel();

  /**
   * results provide properties and metadata to determine the returned data, shape and order.
   * @type {!QueryColumnModel}
   */
  this.results = new QueryColumnModel();

  this.initializeDefaults();
};
var QueryConfigModel = explorer.models.perfkit_simple_builder.QueryConfigModel;


/**
 * Returns a label/value/text object based on a string value.
 * @param {!string} stringval
 * @return {!MetadataFilter}
 */
QueryConfigModel.getMetadataFilterFromString = function(
    stringval) {
  var SEPARATOR = ':';
  var sepIndex = stringval.indexOf(SEPARATOR);
  var rtnVal = {text: stringval};

  if (sepIndex == -1) {
    rtnVal.label = stringval;
  } else if (sepIndex == 0) {
    throw new Error('Invalid label: Cannot start with a separator.');
  } else {
    rtnVal.label = stringval.slice(0, sepIndex);
    rtnVal.value = stringval.slice(sepIndex + 1);
  }

  return rtnVal;
};


/**
 * Applies a querystring (such as a URL, or v1 filter config) to a QueryConfig.
 *
 * @param {!QueryConfigModel} config The model to apply the querystring to.
 * @param {!string} querystring A filter config in URL form.
 */
QueryConfigModel.applyQueryString = function(config, querystring) {
  var queryData = new goog.Uri.QueryData(querystring);

  var startDateParam = queryData.get('start_date');
  if (startDateParam) {
    config['filters']['start_date'] = new DateFilter(
        startDateParam, 'CUSTOM');
  }

  var endDateParam = queryData.get('end_date');
  if (endDateParam) {
    config['filters']['end_date'] = new DateFilter(
        endDateParam, 'CUSTOM');
  }

  var dateGroup = queryData.get('date_group');
  if (goog.isDef(dateGroup)) { config.results.date_group = dateGroup; }

  var productName = queryData.get('product_name');
  if (goog.isDef(productName)) { config.filters.product_name = productName; }

  var test = queryData.get('test');
  if (goog.isDef(test)) { config.filters.test = test; }

  var metric = queryData.get('metric');
  if (goog.isDef(metric)) { config.filters.metric = metric; }

  var runby = queryData.get('runby');
  if (goog.isDef(runby)) { config.filters.runby = runby; }

  var official = queryData.get('official');
  switch (official) {
    case 'all':
      config.filters.official = null;
      break;
    case 'true':
      config.filters.official = true;
      break;
    case 'false':
      config.filters.official = false;
      break;
  }

  var metadataFilters = queryData.getValues('metadata');
  if (metadataFilters.length > 0) {
    config.filters.metadata.splice(0, config.filters.metadata.length);

    for (var ctr = 0, len = metadataFilters.length; ctr < len; ctr++) {
      config.filters.metadata.push(
          QueryConfigModel.getMetadataFilterFromString(metadataFilters[ctr]));
    }
  }

  var labelColumns = queryData.getValues('labelcol');
  if (labelColumns.length > 0) {
    config.results.labels.splice(0, config.results.labels.length);

    for (var ctr = 0, len = labelColumns.length; ctr < len; ctr++) {
      config.results.labels.push({'label': labelColumns[ctr]});
    }
  }
};


/**
 * Initializes the default values for filters and results.
 */
QueryConfigModel.prototype.initializeDefaults = function() {
  this.results.row_limit = DEFAULT_ROW_LIMIT;

  this.results.show_date = true;
  this.results.date_group = QueryDateGroupings.DAY;

  this.results.measure_values = true;
  this.results.measures.push(new MeasureResult(DEFAULT_MEASURE));
};


});  // goog.scope

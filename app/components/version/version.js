'use strict';

angular.module('taxiApp.version', [
  'taxiApp.version.interpolate-filter',
  'taxiApp.version.version-directive'
])

.value('version', '0.1');

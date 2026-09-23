/**
 * GetStoreTab  (CSGetStoreTabReq -> CSGetStoreTabRes)
 *
 * Provides the mall tab specifications (table_type, mall_type, table_name)
 * for the Free Fire client's COW-UIModelMall.ProcessMallTabInfoDict.
 */

'use strict';

const { getStoreTabs } = require('../services/shopService');

function handleGetStoreTab(reqObj, ctx) {
  const storeTables = getStoreTabs();
  ctx.logger.info(`[shop] GetStoreTab returning ${storeTables.length} mall tables`);

  return {
    store_tables: storeTables
  };
}

module.exports = {
  endpoint: 'GetStoreTab',
  reqType: null,
  resType: 'CSGetStoreTabRes',
  handler: handleGetStoreTab
};

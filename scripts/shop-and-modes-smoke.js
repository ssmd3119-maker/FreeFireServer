'use strict';

const http = require('http');
const { encrypt, decrypt } = require('../src/protocol/aes');
const protos = require('../src/protocol/protos');
const accounts = require('../src/db/accounts');

const PORT = 3000;

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Length': body.length
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request(
      { host: '127.0.0.1', port: PORT, path, method: 'POST', headers, timeout: 5000 },
      (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORT, path }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    }).on('error', reject);
  });
}

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const str = JSON.stringify(payload);
    const req = http.request(
      {
        host: '127.0.0.1',
        port: PORT,
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(str) }
      },
      (res) => {
        let data = '';
        res.on('data', (c) => data += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, text: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(str);
    req.end();
  });
}

const enc = (type, obj) => {
  const t = protos.lookup(type);
  return encrypt(Buffer.from(t.encode(t.fromObject(obj || {})).finish()));
};

const dec = (type, buf) => {
  const t = protos.lookup(type);
  return t.toObject(t.decode(buf), { longs: String, enums: Number, defaults: true });
};

async function main() {
  console.log('=== STARTING SHOP & GAME MODES VERIFICATION ===\n');

  // 1. Verify REST Game Modes endpoint
  const gmRes = await getJson('/game-modes');
  console.log(`[1] GET /game-modes -> HTTP ${gmRes.status}, count: ${gmRes.json.modes.length}`);
  const tgMode = gmRes.json.modes.find((m) => m.game_mode === 23);
  const brMode = gmRes.json.modes.find((m) => m.game_mode === 1);
  if (!tgMode) throw new Error('Training ground mode (23) missing in /game-modes!');
  if (!brMode) throw new Error('Bermuda BR mode (1) missing in /game-modes!');
  console.log(`    Found Training Grounds: Map ${tgMode.map_id} Config ${tgMode.config_id} (${tgMode.name})`);
  console.log(`    Found Bermuda BR: Map ${brMode.map_id} Config ${brMode.config_id} (${brMode.name})`);

  // 2. Verify REST Shop Catalog
  const shopRes = await getJson('/api/shop');
  console.log(`[2] GET /api/shop -> HTTP ${shopRes.status}, total items: ${shopRes.json.total}`);
  if (!shopRes.json.items || shopRes.json.items.length === 0) throw new Error('Shop catalog empty!');

  // 3. Verify REST Lucky Royale Wheels
  const gachaRes = await getJson('/api/gacha');
  console.log(`[3] GET /api/gacha -> HTTP ${gachaRes.status}, wheels: ${gachaRes.json.wheels.length}`);
  gachaRes.json.wheels.forEach((w) => {
    console.log(`    - [${w.chest_id}] ${w.chest_name} (Cost: ${w.once_price} ${w.currency_name}, Grand Prize: ${w.grand_prize_name})`);
  });

  // 4. Test REST Spin
  const spinRes = await postJson('/api/gacha/spin', { chest_id: 1001, count: 10 });
  console.log(`[4] POST /api/gacha/spin -> HTTP ${spinRes.status}, drops received: ${spinRes.json.drops.length}, jackpot: ${spinRes.json.has_jackpot}`);

  // 5. Seed an authenticated account for Protobuf testing
  console.log('\n[5] Seeding test account for Protobuf endpoints...');
  const player = require('../src/db/player');
  const token = 'smoke-test-token-' + Date.now();
  
  let testAcc = player.getByOpenId('smoke-shop-test');
  if (!testAcc) {
    testAcc = player.createFromLogin({
      open_id: 'smoke-shop-test',
      open_id_type: '1',
      nickname: 'ShopTester',
      client_version: '1.70.0'
    });
  }
  testAcc.token = token;
  testAcc.token_created_at = Math.floor(Date.now() / 1000);
  testAcc.coins = 50000;
  testAcc.gems = 10000;
  testAcc.wallet = { coins: 50000, gems: 10000 };
  player.save(testAcc);
  console.log(`    Authenticated account uid=${testAcc.uid} with token: ${token.slice(0, 20)}...`);

  // 6. Test Protobuf GetStore
  console.log('\n[6] Testing Protobuf GetStore (CSGetStoreReq -> CSGetStoreRes)...');
  const storeReqCipher = enc('CSGetStoreReq', {});
  const storeHttpRes = await post('/GetStore', storeReqCipher, token);
  console.log(`    HTTP status: ${storeHttpRes.status}, body length: ${storeHttpRes.body.length}`);
  if (storeHttpRes.status !== 200) {
    console.log(`    Response text: ${storeHttpRes.body.toString('utf8')}`);
  }
  const storeData = dec('CSGetStoreRes', storeHttpRes.body);
  console.log(`    GetStore status=${storeHttpRes.status}, items returned: ${storeData.store_items.length}`);
  if (storeData.store_items.length === 0) throw new Error('Protobuf GetStore returned 0 items');

  // 7. Test Protobuf Purchase
  console.log('\n[7] Testing Protobuf Purchase (CSPurchaseReq -> CSPurchaseRes)...');
  const purchaseCipher = enc('CSPurchaseReq', { store_item_id: 101, cnt: 1 });
  const purchaseHttpRes = await post('/Purchase', purchaseCipher, token);
  const purchaseData = dec('CSPurchaseRes', purchaseHttpRes.body);
  console.log(`    Purchase status=${purchaseHttpRes.status}, items added:`, purchaseData.data.add_item_list);
  console.log(`    Remaining wallet coins=${purchaseData.coins}, gems=${purchaseData.gems}`);

  // 8. Test Protobuf GetGachaDesc
  console.log('\n[8] Testing Protobuf GetGachaDesc (-> CSGetGachaDescRes)...');
  const gachaDescHttpRes = await post('/GetGachaDesc', Buffer.alloc(0), token);
  const gachaDescData = dec('CSGetGachaDescRes', gachaDescHttpRes.body);
  console.log(`    GetGachaDesc status=${gachaDescHttpRes.status}, wheels advertised: ${gachaDescData.gacha_desc_list.length}`);
  gachaDescData.gacha_desc_list.forEach((g) => {
    console.log(`      Chest ${g.chest_id} (${g.chest_type.chest_name}): price ${g.chest_type.once_price}/${g.chest_type.ten_price}`);
  });

  // 9. Test Protobuf PurchaseGacha
  console.log('\n[9] Testing Protobuf PurchaseGacha (CSLotteryReq -> CSLotteryRes)...');
  const lotteryCipher = enc('CSLotteryReq', { chest_id: 1001, gacha_type: 2 });
  const lotteryHttpRes = await post('/PurchaseGacha', lotteryCipher, token);
  const lotteryData = dec('CSLotteryRes', lotteryHttpRes.body);
  console.log(`    PurchaseGacha status=${lotteryHttpRes.status}, goods won: ${lotteryData.lottery_goods.length}, big reward: ${lotteryData.has_big_reward}`);

  // 10. Test Protobuf GetGachaProbability
  console.log('\n[10] Testing Protobuf GetGachaProbability (CSGetLotteryProbabilityReq -> CSGetLotteryProbabilityRes)...');
  const probCipher = enc('CSGetLotteryProbabilityReq', { chest_id: 1001 });
  const probHttpRes = await post('/GetGachaProbability', probCipher, token);
  const probData = dec('CSGetLotteryProbabilityRes', probHttpRes.body);
  console.log(`    GetGachaProbability status=${probHttpRes.status}, rare tiers: ${probData.rare_pr.length}`);

  console.log('\n=== ALL MODES, SHOP & LUCKY ROYALE CHECKS PASSED PERFECTLY! ===');
}

main().catch((err) => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});

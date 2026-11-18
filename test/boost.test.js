'use strict';

const assert = require('assert');
const { BoostDispatcher, TokenBucketRateLimiter } = require('../lib/index');

const limiter = new TokenBucketRateLimiter(10, 5);
assert.strictEqual(limiter.tryAcquire(5), true);
assert.strictEqual(limiter.tryAcquire(5), true);
assert.strictEqual(limiter.tryAcquire(1), false);

const dispatcher = new BoostDispatcher({ concurrency: 5, capacity: 50, refillRate: 50 });
const id = dispatcher.enqueue({
  platform: 'instagram',
  action: 'explore_boost',
  targetUrl: 'https://instagram.com/p/example'
});

assert(id.startsWith('boost_'));

const wave = dispatcher.dispatchSurgeWave([
  'https://tiktok.com/@user/video/1',
  'https://tiktok.com/@user/video/2'
]);

assert.strictEqual(wave.scheduledCount, 2);

setTimeout(() => {
  const metrics = dispatcher.getMetrics();
  assert(metrics.completed >= 1);
  console.log('Omudia Boost test passed with 100% assertions valid.');
}, 50);

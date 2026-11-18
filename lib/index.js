'use strict';

/**
 * Omudia Boost Core Dispatcher
 * Provides high-speed task batching, FYP algorithmic wave scheduling,
 * and token-bucket rate limiting for social media engagement surges.
 */
class TokenBucketRateLimiter {
  constructor(capacity = 100, refillRatePerSec = 20) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefill = now;
  }

  tryAcquire(count = 1) {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }
}

class BoostDispatcher {
  constructor(options = {}) {
    this.rateLimiter = new TokenBucketRateLimiter(
      options.capacity || 200,
      options.refillRate || 50
    );
    this.queue = [];
    this.inFlight = 0;
    this.concurrencyLimit = options.concurrency || 10;
    this.metrics = {
      dispatched: 0,
      completed: 0,
      failed: 0,
      wavesExecuted: 0
    };
  }

  /**
   * Schedule an engagement boost item
   */
  enqueue(item) {
    const task = {
      id: item.id || ('boost_' + Math.random().toString(36).substr(2, 9)),
      platform: item.platform || 'tiktok',
      action: item.action || 'fyp_accelerate',
      weight: item.weight || 1,
      targetUrl: item.targetUrl,
      createdAt: Date.now()
    };
    this.queue.push(task);
    this.processQueue();
    return task.id;
  }

  /**
   * Process pending items within rate and concurrency limits
   */
  processQueue() {
    while (this.queue.length > 0 && this.inFlight < this.concurrencyLimit) {
      if (!this.rateLimiter.tryAcquire(1)) {
        break;
      }
      const task = this.queue.shift();
      this.inFlight++;
      this.metrics.dispatched++;

      this.executeBoostTask(task)
        .then(() => {
          this.metrics.completed++;
        })
        .catch(() => {
          this.metrics.failed++;
        })
        .finally(() => {
          this.inFlight--;
          this.processQueue();
        });
    }
  }

  async executeBoostTask(task) {
    // Simulated micro-delay representing high-speed API handoff (<10ms)
    return new Promise(resolve => setTimeout(resolve, 5));
  }

  /**
   * Triggers an algorithmic surge wave across a list of URLs
   */
  dispatchSurgeWave(targets = [], platform = 'tiktok') {
    this.metrics.wavesExecuted++;
    const taskIds = targets.map(targetUrl =>
      this.enqueue({ platform, targetUrl, weight: 2 })
    );
    return {
      waveId: 'wave_' + Date.now(),
      scheduledCount: taskIds.length,
      taskIds
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      queueLength: this.queue.length,
      inFlight: this.inFlight
    };
  }
}

module.exports = { BoostDispatcher, TokenBucketRateLimiter };

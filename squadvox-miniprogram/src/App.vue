<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global CSS */
page, body {
  background-color: #080b11;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  min-height: 100vh;
}

/* Custom Scrollbar from Prototype */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(8, 11, 17, 0.5);
}

::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.35);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.7);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Glass Effect */
.glass-card {
  background: rgba(17, 23, 35, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-nav {
  background: rgba(8, 11, 17, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.glow-cyan {
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.25);
}

.glow-accent {
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.3);
}

/* Device frame wrap */
.mobile-frame-wrap {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Voice Wave Animations from Prototype */
@keyframes voicePulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.75); }
  70% { transform: scale(1.06); box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.voice-active {
  animation: voicePulse 1.4s infinite cubic-bezier(0.4, 0, 0.6, 1);
  border-color: #10b981 !important;
}

@keyframes soundBar {
  0%, 100% { height: 4px; }
  50% { height: 18px; }
}

.bar-1 { animation: soundBar 0.7s infinite 0.1s ease-in-out; }
.bar-2 { animation: soundBar 0.9s infinite 0.3s ease-in-out; }
.bar-3 { animation: soundBar 0.6s infinite 0.2s ease-in-out; }
.bar-4 { animation: soundBar 0.8s infinite 0.4s ease-in-out; }

/* Uni-App Button Resets */
uni-button {
  background-color: transparent;
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}
uni-button::after {
  display: none !important;
}
</style>

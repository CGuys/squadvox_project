require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
// 头像走 base64 JSON 上传，默认 100kb 不够，放宽到 5mb
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

// 用户上传的头像静态托管（saveInfo 里存的是这个目录下的 URL）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/squadvox/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ code: 404, msg: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ code: 500, msg: 'Internal Server Error' });
});

// 绑定 0.0.0.0，让同一局域网内的手机（真机调试）也能访问
app.listen(port, '0.0.0.0', () => {
  console.log(`SquadVox Server is running on port ${port}`);
  console.log(`  本机访问:   http://127.0.0.1:${port}/squadvox/api`);
  printLanAddresses(port);
});

// 打印局域网 IP，方便真机调试时直接复制到小程序里
function printLanAddresses(port) {
  const os = require('os');
  const ifaces = os.networkInterfaces();
  const lanIps = [];
  for (const name of Object.keys(ifaces)) {
    for (const info of ifaces[name]) {
      // 只取 IPv4 且非回环地址
      if (info.family === 'IPv4' && !info.internal) {
        lanIps.push(info.address);
      }
    }
  }
  if (lanIps.length) {
    console.log('  真机访问(同一 WiFi):');
    lanIps.forEach(ip => console.log(`    http://${ip}:${port}/squadvox/api`));
  } else {
    console.log('  未检测到局域网 IP，请确认已连接 WiFi/有线网络');
  }
}

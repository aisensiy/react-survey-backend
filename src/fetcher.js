import axios from 'axios';

const fetcher = axios.create({
  baseURL: 'https://api.leancloud.cn/1.1',
  headers: {
    'Content-Type': 'application/json',
    'X-LC-Id': process.env.LEANCLOUD_APP_ID,
    'X-LC-Key': process.env.LEANCLOUD_APP_MASTER_KEY + ',master'
  }
});

export default fetcher;

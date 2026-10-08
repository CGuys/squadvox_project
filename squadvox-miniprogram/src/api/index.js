import { request } from '../utils/request';

// User APIs
export const login = (data) => request({ url: '/user/login', method: 'POST', data });
export const saveInfo = (data) => request({ url: '/user/saveInfo', method: 'POST', data });
export const getInfo = () => request({ url: '/user/getInfo', method: 'GET' });

// Room APIs
export const createRoom = (data) => request({ url: '/room/create', method: 'POST', data });
export const listRooms = (data) => request({ url: '/room/list', method: 'GET', data });
export const enterRoom = (data) => request({ url: '/room/enter', method: 'POST', data });
export const closeRoom = (data) => request({ url: '/room/close', method: 'POST', data });
export const kickMember = (data) => request({ url: '/room/kick', method: 'POST', data });

// TRTC APIs
export const getSig = () => request({ url: '/trtc/getSig', method: 'POST' });

// Message APIs
export const sendMessage = (data) => request({ url: '/msg/send', method: 'POST', data });

// Report APIs
export const submitReport = (data) => request({ url: '/report/submit', method: 'POST', data });

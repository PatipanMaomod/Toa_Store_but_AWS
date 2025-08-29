import http from "k6/http";
import { sleep } from "k6";

// export let options = {
//   stages: [
//     { duration: "30s", target: 20 },  // ขึ้นเป็น 20 users
//     { duration: "1m", target: 50 },   // คงที่ 50 users
//     { duration: "30s", target: 0 },   // ลดลง
//   ],
// };

export let options = {
  stages: [
    { duration: "1m", target: 100 },   // ramp up to 50 users
    { duration: "1m", target: 200 },  // hold at 100 users
    { duration: "1m", target: 300 },  // peak 200 users
    { duration: "1m", target: 0 },    // ramp down
  ],
};

export default function () {
  http.get("http://15.168.239.19:4000"); // แก้เป็น URL ของเว็บคุณ
  sleep(1);
}

const NUM_RAIDS_ATTENDANCE = 14;

function attendanceStringToList(str) {
  let attendance = [];
  if (str)
  [...str].forEach(c => {
    if (c == 'A') {
      attendance.push(true);
    } else {
      attendance.push(false);
    }
  });
  return attendance;
}

function attendanceListToString(list) {
  let str = [];
  list.forEach(c => {
    if (c) {
      str.push('A');
    } else {
      str.push('.');
    }
  });
  return str.join("");
}

function addAttendance(member) {
  member.attendance = member.attendance.slice(-(NUM_RAIDS_ATTENDANCE-1));
  member.attendance.push(true);
}

function markMissedAttendance(member) {
  member.attendance = member.attendance.slice(-(NUM_RAIDS_ATTENDANCE-1));
  member.attendance.push(false);
}

function setAttendance(member, history) {
  member.attendance = attendanceStringToList(history);
  member.attendance = member.attendance.slice(-(NUM_RAIDS_ATTENDANCE-1));
}

function getAttPercent(member) {
  let attendancePercentage =
    (member.attendance.filter(c => c).length / member.attendance.length) *
    100.0;
  if (isNaN(attendancePercentage)) {
    attendancePercentage = 0;
  }
  return attendancePercentage;
}

module.exports = {
  getAttPercent: getAttPercent,
  setAttendance: setAttendance,
  markMissedAttendance: markMissedAttendance,
  addAttendance: addAttendance,
  attendanceListToString: attendanceListToString,
  attendanceStringToList: attendanceStringToList,
  NUM_RAIDS_ATTENDANCE: NUM_RAIDS_ATTENDANCE,
}
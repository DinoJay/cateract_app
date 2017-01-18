import moment from 'moment';

function dateDiff(a, b, t) {
  const aDate = moment(a);
  const bDate = moment(b);
  return Math.ceil(bDate.diff(aDate, t, true));
}

export { dateDiff };

const interfacePath = `http://219.233.221.231:38080`;

export const serverPath = `http://219.233.221.231:38080`;

export const queryChildrenColumnById = ({cId, level}) => {
  const requestUrl = `${interfacePath}/EMSP_CMS/queryChildrenColumnById?cId=${cId}&level=${level}`;

  return fetch(requestUrl).then(response => response.json());
};

export const getCMSarticleByCId = ({cId, pageSize, currentPage}) => {
  const requestUrl = `${interfacePath}/EMSP_CMS/getCMSarticleByCId?cId=${cId}&pageSize=${pageSize}&currentPage=${currentPage}`;
  console.log(`api getCMSarticleByCId() requestUrl: ${requestUrl}`);
  return fetch(requestUrl).then(response => response.json());
};

function articleDataHandler(res) {
  //自己处理返回数据
  var JSON_PROTECTION_PREFIX = /^\)\]\}',?\n/;
  // Strip json vulnerability protection prefix and trim whitespace
  res = res.replace(JSON_PROTECTION_PREFIX, '').trim();

  //转义字符
  function doubleEscape(str) {
    str = str.replace(/\n/g, '\\\\n');
    str = str.replace(/\t/g, '\\\\t');
    str = str.replace(/\r/g, '\\\\r');
    str = str.replace(/"/g, '"');
    return str;
  }

  res = doubleEscape(res);

  //todo:不安全，文章返回数据不符合json格式规范
  //用eval替换res.json()
  let body = eval('(' + res + ')');
  return body;
}

export const getArticle = ({articleId}) => {
  const params = `{queryBy:'articleId',articleId:'${articleId}',fetchField:'Content,Title,ID'}`;
  const requestUrl = `${interfacePath}/EMSP_CMS/getArticle?requestJson=${encodeURIComponent(
    params,
  )}`;

  console.log(`api getArticle() requestUrl: ${requestUrl}`);
  return fetch(requestUrl)
    .then(response => response.text())
    .then(text => articleDataHandler(text));
};

export const login = ({logid, password, deviceid}) => {
  const requestUrl = `${interfacePath}/easydms/APP/checkuser/userconfirmAPP?logid=${logid}&password=${password}&deviceid=${deviceid}`;

  console.log(`[api] login() requestUrl: ${requestUrl}`);

  return fetch(requestUrl).then(response => response.json());
};

export const getAreaList = ({caCard, areaId, curPage, pageSize}) => {
  const requestUrl = `${interfacePath}/easydms/user/getCusAreaInfo?caCard=${caCard}&areaId=${areaId}&curPage=${curPage}&pageSize=${pageSize}`;
  console.log(`[api] getArea() requestUrl: ${requestUrl}`);

  return fetch(requestUrl).then(response => response.json());
};

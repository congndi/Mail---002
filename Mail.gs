const RMAIL  = "R-Mail";
const SMAIL    = "S-Mail";
const SCRIPT_PROP = PropertiesService.getScriptProperties();


function setup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROP.setProperty("key", doc.getId());
}


function doGet(request) {
  const { parameter } = request
  switch (parameter.action) {
    case 'sendMail':
        response = sendMail(parameter);
        break;
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  
}
const doPost = (request) => {
  const { parameter } = request
  switch (parameter.action) {
    case 'sendMail':
      response = sendMail(parameter);
      break;
    case 'getQuota':
      response = getQuota();
      break;
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function checkQuota(){
  const listMails = getData(SMAIL);
  if(listMails.length){
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"))
    var sheet = doc.getSheetByName(SMAIL);
    listMails.forEach(mail => {
        var options = {
            'method' : 'post',
            'payload' : {
              action: 'getQuota'
            }
        };
        let res = UrlFetchApp.fetch(mail.App_Url, options);
        res = JSON.parse(res)
        Logger.log('C' + (mail.row + 1))
        sheet.getRange('C' + (mail.row + 1)).setValue(res.value);
    })
  }
}

function getQuota(){
  return {value: MailApp.getRemainingDailyQuota()};
}


function sendMailAll(data){

    let listSMails = getData(SMAIL);
    let listRMails = getData(RMAIL);

    if(Object.values(listSMails).length == 0)
      return;
    
    
    if(listRMails.length){
      let key = 0;
      listRMails.forEach(row => {
        
        const mail = formatMailContent(data, row)
         if(key > Object.values(listSMails).length - 1)
            key = 0
        const smail = listSMails[key]
       
        sendMailPostRequest(Object.assign({action: 'sendMail', smail: listSMails[key]}, mail), listSMails[key].App_Url);
        key++;
      })
      
    }
    return;
}

function sendMail(data){
  
    if(!data.Email)
    return {success: false, msg: 'Không tìm thấy Email khách hàng'}

    var emailAddress = data.Email; 
    var content = data.content; 
    var subject = data.subject;
    MailApp.sendEmail(emailAddress, subject, '', {htmlBody: content});
    return {data, quota: MailApp.getRemainingDailyQuota(), success: true}
}

function sendMailPostRequest(request, url){
  Logger.log(request)
  Logger.log(url)
  var options = {
      'method' : 'post',
      'payload' : request
  };
  let res = UrlFetchApp.fetch(url, options);
  res = JSON.parse(res)
  if(res?.success ?? false){
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"))
    var smail = doc.getSheetByName(SMAIL);
    var rmail = doc.getSheetByName(RMAIL);
    smail.getRange('C' + (request.smail.row + 1)).setValue(res.quota);
    rmail.getRange(request.res_column + (request.row + 1)).setValue('Đã gửi').setBackground("#D9EAD3");
    rmail.getRange(request.res_email_column + (request.row + 1)).setValue(request.smail.Email)
  }
  else{
    rmail.getRange(request.res_column + (request.row + 1)).setValue('Có lỗi').setBackground("#EA4335");
  }

}


function formatMailContent(mail, row){
  const new_mail = {...mail}
  const new_row = {...row}
  Object.keys(new_row).forEach(key => {
    new_mail.subject = new_mail.subject.replaceAll(`[${key}]`, new_row?.[key] ?? '');
    new_mail.content = new_mail.content.replaceAll(`[${key}]`, new_row?.[key] ?? '');
  })
  
  return Object.assign(new_mail, new_row)
}


function getData(sheet_name){
  var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  var sheet = doc.getSheetByName(sheet_name);
  values = sheet.getDataRange().getValues();
  return valuesToObject(values);
}



function valuesToObject(array) {
  const newArray = []
  const key = array[0];
  array.forEach((row, index) => {

    if (index == 0)
      return;
    const data = {}
    row.forEach((c, i) => {
      data.row = index
      data[key[i]] = c
    })
    newArray.push(data);
  })

  return newArray;
}

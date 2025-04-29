function _getData(params){
  Logger.log(params);
  var doc = params.SpreadsheetApp.openById(params.SCRIPT_PROP.getProperty("key"));
  var sheet = doc.getSheetByName(params.sheet_name);
  values = sheet.getDataRange().getValues();
  return valuesToObject(values);
}

function _sendMail(data, MAIL_APP){
  
    if(!data.Email)
    return {success: false, msg: 'Không tìm thấy Email khách hàng'}

    var emailAddress = data.Email; // First column
    var content = data.content; // Second column
    var subject = data.subject;
    MAIL_APP.sendEmail(emailAddress, subject, '', {htmlBody: content});
    return {data, quota: MAIL_APP.getRemainingDailyQuota(), success: true}
}

function _getQuota(MAIL_APP){
  Logger.log(MAIL_APP.getRemainingDailyQuota())
  return {value: MAIL_APP.getRemainingDailyQuota()};
}

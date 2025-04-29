function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Email Menu')
      .addItem('Gửi Email tới khách hàng', 'showDialogEmail')
      .addItem('Kiểm tra giới hạn Email còn lại', 'checkQuota')
      .addToUi();
}

function showDialogEmail(){
  var html = HtmlService.createHtmlOutputFromFile('Mailbox')
      .setWidth(600)
      .setHeight(800);
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showModalDialog(html, 'Gửi Email tới Khách hàng');
}

function q_email_list(){
  const smails = getData(SMAIL);
  const quota = smails.map(el => el.Quota ?? 0).reduce((a,b) => {return a + b},0)
  const list = getData(RMAIL);
  const emails = []
  list.forEach(el => {
    // if(el.Email  && !emails.includes(el.Email))
    if(el.Email)
      emails.push(el.Email)
  })
  return {emails, quota: quota, success: true}
}
function updateProgressClient(current, total) {
  const html = HtmlService.createHtmlOutput(`
    <script>
      window.parent.updateProgress(${current}, ${total});
      if (${current} === ${total}) {
        window.parent.showDoneMessage();
      }
    </script>
  `);
  SpreadsheetApp.getUi().showModalDialog(html, "Đang gửi...");
}

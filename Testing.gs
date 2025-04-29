function test() {
  const arr = [1,2,3,4,5,6,7,8,9]
  arr.forEach(el => {
    Logger.log(el);
    Utilities.sleep(1.5*1000);
  })
}

export class CommandHistory {
  constructor(){
    this.commandHistoryList = [];
    this.lastIndex = -1;
    this.current = this.commandHistoryList[this.commandHistoryList.length-1];
  }

  push(inputString){
    this.commandHistoryList.push(inputString);
    this.lastIndex = this.commandHistoryList.length-1;
    console.log(this.commandHistoryList, this.lastIndex);
    console.log(this.commandHistoryList[this.lastIndex])
  }

  print(){
    let str = "";
    for(let i = 0; i < this.commandHistoryList.length; i++){
      str += this.commandHistoryList[i] + " ";
    }
    return str;
  }

  prev(){
    this.lastIndex--;
    if(this.lastIndex < 0) this.lastIndex = 0;
  }

  next(){
    this.lastIndex++;
    if(this.lastIndex > this.commandHistoryList.length-1) this.lastIndex = this.commandHistoryList.length-1;
  }

  peekLast(){
    return this.commandHistoryList[this.lastIndex];
  }
}


export class FileSystem {
  constructor(){
    this.root = new Directory("home");
    this.currDir = this.root;
    this.directoryList = [];
  }

  /**
   * @param {string} commandName
   * @param {string} path
   * @param {string} args
   * @return {Associative array}
   */
  argumentsValidator(commandName, argsArray){
    let key = argsArray[0];
    let keyNode = this.currDir.linkedList.findNode(key);
    console.log(key, keyNode);

    switch(commandName){
      case 'touch':
        if(argsArray.length !== 1) return {'isValid': false, 'errorMessage': 'Command ' + commandName + ' requires exactly 1 argument'};
        else if(keyNode !== null) {
          this.currDir.setDateModified();
          return {'isValid': false, 'errorMessage': 'filePath must not refer to a node that already exists in the file system'}
        };
        break;
      case 'mkdir':
        if(argsArray.length !== 1) return {'isValid': false, 'errorMessage': 'Command ' + commandName + ' requires exactly 1 argument'};
        else if(this.directoryList.includes(key)) return {'isValid': false, 'errorMessage': 'filePath must not refer to a node that already exists in the file system'}
        break;
      case 'ls':
        if(argsArray.length != 0 && argsArray.length != 1) return {'isValid': false, 'errorMessage': 'Command ' + commandName + ' should contain no argument or exactly 1 argument'};
        else if(key !== undefined && keyNode === null) return {'isValid': false, 'errorMessage': 'filePath must point to a node that exists in the file system.'}
        break;
      case 'cd':
        if(argsArray.length !== 1) return {'isValid': false, 'errorMessage': 'Command ' + commandName + ' requires exactly 1 argument'};
        else if(!this.directoryList.includes(key) && key !== '..') return {'isValid': false, 'errorMessage': 'filePath should point to a node that exists in the file system or should be ".."'}
        else if(keyNode !== null && keyNode.type === "file") return {'isValid': false, 'errorMessage': 'filePath must refer to a node of type "directory"'}
        break;
      case 'pwd':
        if(argsArray.length !== 0) return {'isValid': false, 'errorMessage': 'Command ' + commandName + ' must not have an argument'};
        break;
      case 'print':
        if(argsArray.length != 1) return {'isValid': false, 'errorMessage': 'Command ' + commandName + ' requires exactly 1 argument'};
        else if(keyNode === null) return {'isValid': false, 'errorMessage': 'filePath must point to a node that exists in the file system.'}
        else if(keyNode.type !== "file") return {'isValid': false, 'errorMessage': 'filePath must refer to a node of type "file"'}
        break;
      case 'setContent':
        if(argsArray.length != 2) return {'isValid': false, 'errorMessage': 'Command ' + commandName + ' requires exactly 1 argument'};
        else if(keyNode === null) return {'isValid': false, 'errorMessage': 'filePath must point to a node that exists in the file system.'}
        else if(keyNode.type !== "file") return {'isValid': false, 'errorMessage': 'filePath must refer to a node of type "file"'}
        break;
      case 'rm':
        if(argsArray.length != 1) return {'isValid': false, 'errorMessage': 'Command ' + commandName + ' requires exactly 1 argument'};
        else if(keyNode === null) return {'isValid': false, 'errorMessage': 'filePath must point to a node that exists in the file system.'}
        break;
      case 'help':
        if(argsArray.length !== 0) return {'isValid': false, 'errorMessage': 'Command ' + commandName + ' must not have an argument'}
    }

    return {'isValid': true, 'errorMessage': ''};
  }

  applyCommand(commandName, argsArray){
    if(commandName == "touch") return this.touch(argsArray[0]);
    else if(commandName == "mkdir") return this.mkdir(argsArray[0]);
    else if(commandName == "ls") return this.ls(argsArray[0]);
    else if(commandName == "cd") return this.cd(argsArray[0]);
    else if(commandName == "pwd") return this.pwd();
    else if(commandName == "print") return this.print(argsArray[0]);
    else if(commandName == "setContent") return this.setContent(argsArray[0], argsArray[1]);
    else if(commandName == "rm") return this.rm(argsArray[0]);
    else if(commandName == "help") return this.help();
    else console.log("invalid command in applyCommand");
  }

  touch(name){
    let newFile = new File(name);
    newFile.setParent(this.currDir);
    this.currDir.linkedList.add(newFile);

    return 'created ' + name + ' file';
  }
  /**
   * @point push name to this.directoryList 
   */
  mkdir(name){
    let newDirectory = new Directory(name);
    newDirectory.setParent(this.currDir);
    this.currDir.linkedList.add(newDirectory);
    this.directoryList.push(name);
    console.log(this.directoryList);

    return 'created ' + name + ' directory';
  }
  /**
   * @point no argument -> print all node in current directory
   * @point 1 argument -> for node.type "dir", print all list, otherwise, return file
   */
  ls(name){
    if(name === undefined) return this.currDir.linkedList.printList();

    let keyNode = this.currDir.linkedList.findNode(name);
    if(keyNode.type === "dir") return keyNode.linkedList.printList();
    else return keyNode.getName();
  }
  cd(name){
    let keyNode = this.currDir.linkedList.findNode(name);

    if(name === "..") this.currDir = this.currDir.parent;
    else this.currDir = keyNode;
    return 'changed current working directory';
  }
  pwd(){
    let iterator = this.currDir;

    let path = "/";
    while(iterator !== null){
        path = "/" + iterator.getName() + path;
        iterator = iterator.parent;
    }
    return path;
  }
  print(name){
    return this.currDir.linkedList.findNode(name).getContent();
  }
  setContent(name, content){
    this.currDir.linkedList.findNode(name).setContent(content);
    return 'setContent for ' + name + ' file';
  }
  rm(name){
    let keyNode = this.currDir.linkedList.findNode(name);

    if(keyNode.type === "dir") this.directoryList = this.directoryList.filter(name => name !== keyNode.name);

    let deletedNode = this.currDir.linkedList.delete(name);
    return 'deleted ' + deletedNode;
  }
  help(){
    let str = (
      <table>
        <thead>
          <tr>
            <th style={{ padding: "10px" }}>COMMAND</th>
            <th style={{ padding: "10px" }}>OPTION</th>
            <th style={{ padding: "10px" }}>DESCRIPTION</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: "center" }}>touch</td>
            <td style={{ textAlign: "center" }}>touch [fileName]</td>
            <td style={{ textAlign: "center" }}>Create a new file with a name</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>mkdir</td>
            <td style={{ textAlign: "center" }}>mkdir [directoryName]</td>
            <td style={{ textAlign: "center" }}>Create a new directory with a name</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>ls</td>
            <td style={{ textAlign: "center" }}>ls OR ls [file OR directory Name]</td>
            <td style={{ textAlign: "center" }}>Output a list of each file contained in directory OR Output a single file</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>cd</td>
            <td style={{ textAlign: "center" }}>cd [directoryName], cd [directoryName/directoryName] or cd ..</td>
            <td style={{ textAlign: "center" }}>Change current working directory to specified directory or Change current working directory to parent directory</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>pwd</td>
            <td style={{ textAlign: "center" }}>---</td>
            <td style={{ textAlign: "center" }}>Output a path of the current working directory</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>print</td>
            <td style={{ textAlign: "center" }}>print [fileName]</td>
            <td style={{ textAlign: "center" }}>Output the contents of specified file</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>setContent</td>
            <td style={{ textAlign: "center" }}>setContent [fileName] [newContent]</td>
            <td style={{ textAlign: "center" }}>Replace the contents of the given fileName with the new contents</td>
          </tr>
          <tr>
            <td style={{ textAlign: "center" }}>rm</td>
            <td style={{ textAlign: "center" }}>rm [file OR directory Name]</td>
            <td style={{ textAlign: "center" }}>Remove the given file or directory.</td>
          </tr>
        </tbody>
      </table>
    )
    return str;
  }
}

class Node {
  constructor(name, type){
    this.name = name;
    this.type = type;
    this.dateCreated = new Date();
    this.dateModified = this.dateCreated;
    this.parent = null;
    this.next = null;
  }

  setName(name){ this.name = name; }
  setParent(currDir){ this.parent = currDir; }
  setDateModified(){ this.dateModified = new Date(); }

  getName(){ return this.name; }
  getType(){ return this.type; }
  getParent(){ return this.parent; }
  getDateCreated(){ return this.dateCreated; }
  getDateModified(){ return this.dateModified; }
}

class Directory extends Node {
  constructor(name){
    super(name, "dir");
    this.linkedList = new SinglyLinkedList();
  }
}

class File extends Node {
  constructor(name){
    super(name, "file");
    this.content = '';
  }

  setContent(content){ this.content = content; }
  getContent(){ return this.content; }
}

class SinglyLinkedList {
  constructor(){
    this.head = null;
  }

  getHead(){ return this.head; }

  add(newNode){
    if(this.head === null) {
      newNode.next = this.head;
      this.head = newNode;
      return;
    }
    let iterator = this.head;
    while(iterator.next !== null){
      iterator = iterator.next;
    }
    iterator.next = newNode;
    return;
  }

  popFront(){
    let temp = this.head;
    this.head = this.head.next;
    return temp.name;
  }

  delete(name){
    if(this.head.name == name) return this.popFront();

    let iterator = this.head;
    while(iterator.next.name != name){
      iterator = iterator.next;
    }
    let temp = iterator.next;
    iterator.next = iterator.next.next;
    return temp.name;
  }

  findNode(name){
    let iterator = this.head;
    while(iterator !== null){
      if(iterator.name === name) return iterator;
      iterator = iterator.next;
    }
    return null;
  }

  printList(){
    let iterator = this.head;
    let str = "";
    while(iterator != null){
      str += iterator.getName() + "  ";
      iterator = iterator.next;
    }
    return str;
  }
}

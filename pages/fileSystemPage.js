import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import {Container, TextField} from '@material-ui/core'
import styles from '../styles/Home.module.css'

import {Config} from '../config/index'
import {ConfigFSTools} from '../config/fstools'
import { FileSystem } from '../model/fstools'
import { CommandHistory } from '../model/history'

const FileSystemPage = () => {
  const [input, setInput] = useState({value: ''});
  const [resArr, setResArr] = useState([]);
  const [FSObj, setFSObj] = useState(null);
  const [CHObj, setCHObj] = useState(null);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const scrollArea = document.getElementById('scroll-area');
    if(scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [resArr]);

  useEffect(() => {
    setFSObj(new FileSystem());
    setCHObj(new CommandHistory());
  }, []);


  const handleKeyPress = (event) => {
    if(event.key == "Enter"){
      event.preventDefault();
      let parsedStringInputArray = commandLineParser(input.value);

      let commandName = parsedStringInputArray[0];
      // let argsArray = parsedStringInputArray.slice(1);
      let argsArray = [];
      let tempArgsArray = parsedStringInputArray.slice(1);

      if(commandName == "setContent"){
        let arr = tempArgsArray.slice(1);
        let content = arr.reduce((total, curr) => total + " " + curr);
        argsArray.push(parsedStringInputArray[1], content);
      }
      else if(commandName == "cd"){
        let arr = tempArgsArray[0].split("/");
        argsArray.push(arr[arr.length-1]);
      }
      else argsArray = tempArgsArray.concat();

      console.log(argsArray);

      let validatorResponse = parsedArrayValidator(commandName, argsArray);
      // コマンドを実行
      if(validatorResponse['isValid']) validatorResponse['errorMessage'] = FSObj.applyCommand(commandName, argsArray);
      // CLIに反映
      appendResult(validatorResponse['isValid'], validatorResponse['errorMessage']);

      CHObj.push(input.value);

      let commandList = CHObj.print();
      console.log(commandList);
    }
  }

  /**
   * リファクタリング
   */
  const handleHistory = (event) => {
    if(event.keyCode == 38){
      setFlag(true);
      if(flag) setInput({value: CHObj.peekLast()});
      CHObj.prev();
    }
    else if(event.keyCode == 40){
      CHObj.next();
      setInput({value: CHObj.peekLast()})
    }
  }

  const handleChange = (event) => {
    event.preventDefault();
    setInput({value: event.target.value});
  }

  /**
   * @param {string} inputString
   * @return {array}
   */
  const commandLineParser = (inputString) => {
    let parsedStringInputArray = inputString.trim().split(" ");
    return parsedStringInputArray;
  }

  /**
   * @param {string} commandName
   * @param {string} path
   * @param {string} args
   * @return {Associative array}
   * @validation universalValidator & argumentsValidator
   */
  const parsedArrayValidator = (commandName, argsArray) => {
    let validatorResponse = universalValidator(commandName);
    if(!validatorResponse['isValid']) return validatorResponse;

    validatorResponse = FSObj.argumentsValidator(commandName, argsArray);
    if(!validatorResponse['isValid']) return validatorResponse;

    return {'isValid': true, 'errorMessage': ''}
  }

  /**
   * @param {string} commandName
   * @return {Associative array}
   * @rules First token must start with CCTools, Second token must be selected from valid commands
   */
  const universalValidator = (commandName) => {
    if(!ConfigFSTools.validCommandList.includes(commandName)) {
      const validCommands = ConfigFSTools.validCommandList.join(",");
      return {'isValid': false, 'errorMessage': "File System only supports the following commands: " + validCommands}
    }

    return {'isValid': true, 'errorMessage': ''}
  }


  const appendResult = (isValid, output) => {
    let echo = (
      <p>
        <span style={{ color: "green" }}>{Config.userName}</span>
        <span style={{ color: "red" }}> @ </span>
        <span style={{ color: "pink" }}> {Config.deviceName} </span>
        : {input.value}
      </p>
    );
    setInput({value: ''});
    if(isValid){
      let temp = (<p id="scroll-area">: {output}</p>);
      setResArr([...resArr, echo, temp])
    }
    else{
      let temp = (<p id="scroll-area"><span style={{ color: "red" }}>CLIError</span>: {output}</p>);
      setResArr([...resArr, echo, temp])
    }
    return;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100vh" }} className={styles.fsContainer}>
      <Head>
        <title>File System</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Spartan:wght@500&display=swap" rel="stylesheet" />
      </Head>
      <div>
        <h1 style={{ textAlign: "center", marginBottom: "2.5rem", marginTop: "0px" }}>File System</h1>
      </div>
      <Container maxWidth="md" style={{ padding: "0px" }} className={styles.resultBackground}>

        {/* 1st section */}
        <div style={{ textAlign: "center", padding: "0.5rem" }} className={styles.headerBackground}>
          <h3 style={{ textAlign: "center"}}>Format: commandName (optional argument)</h3>
          <h3 style={{ textAlign: "center" }}>~ List of available command names ~</h3>
          <p>[ touch, mkdir, ls, cd, pwd, print, setContent, rm ]</p>
          <h5>Type help to see each format in details</h5>
        </div>

        {/* 2nd section */}
        <Container style={{ height: "35vh", padding: "1rem", color: "white" }} className={styles.outputContainer} id={"scroll-area"}>
          {resArr}
        </Container>

        {/* 3rd section  */}
        <form noValidate autoComplete='off'>
          <TextField id="outlined-full-width" fullWidth variant="outlined" placeholder="type any commands" className={styles.textFieldBackground} value={input.value} onChange={handleChange} onKeyPress={handleKeyPress} onKeyUp={handleHistory} onKeyDown={handleHistory}/>
        </form>
      </Container>
    </div>
  )
}

export default FileSystemPage

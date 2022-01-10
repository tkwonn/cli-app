import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import {Container, TextField} from '@material-ui/core'
import styles from '../styles/Home.module.css'

import {Config} from '../config/index'
import {ConfigBTools} from '../config/btools'


const BToolPage = () => {
  const [input, setInput] = useState({value: ''});
  const [resArr, setResArr] = useState([]);

  useEffect(() => {
    const scrollArea = document.getElementById('scroll-area');
    if(scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [resArr]);

  async function handleKeyPress(event){
    if(event.key == "Enter"){
      event.preventDefault();
      let parsedArray = commandLineParser(input.value);

      appendEcho();
      if(parsedArray.length == 0 || parsedArray[0] != "BTools"){
        appendError();
        return;
      }
      // テキストフィールドからのリクエスト時にAPIエンドポイントのURLに付加されるフォームクエリ文字列
      let queryString = await queryStringFromParsedArray(parsedArray);
      queryResponseObjectFromQueryString(queryString);
    }
  }

  const handleChange = (event) => {
    event.preventDefault();
    setInput({value: event.target.value});
  }

  /**
   * @param {string} inputString
   * @return {array}
   * @rules packageName must be "BTools" commandName is either "search" or "isbn-lookup", argument is author=? or title=? or author=?,title=?, and it must not contain more than 2 spaces. 
   * 各パラメータは一回のみ使用可
   */
  const commandLineParser = (inputString) => {
    let parsedArray = inputString.trim().split(" ");

    if(parsedArray.length != 3 || parsedArray[0] != "BTools" || !ConfigBTools.validCommandList.includes(parsedArray[1])) return [];
    if(parsedArray[1] == "search"){
      // author=?,title=?のように両方含んでいた場合を考慮する
      let parsedArguments = parsedArray[2].split(",");
      let authorCount = 0;
      let titleCount = 0;
      for(let i = 0; i < parsedArguments.length; i++){
        if(characterInstanceCountInString("=", parsedArguments[i]) != 1) return [];

        if(parsedArguments[i].indexOf("author") == 0) authorCount++;
        else if(parsedArguments[i].indexOf("title") == 0) titleCount++;
        else return [];
      }
      if(authorCount > 1 || titleCount > 1) return [];
    }
    return parsedArray;
  }

  /**
   * @param {string} inputChar : 検索対象の単一文字列
   * @param {string} inputString : inputCharのインスタンスのために検索される対象の文字列
   * @return {number} : inputString内のinputCharのインスタンス数
   */
  const characterInstanceCountInString = (inputChar, inputString) => {
    if(inputChar.length != 1 || typeof inputChar != "string" || typeof inputString != "string") return -2;
    // ["author", "="]
    return inputString = "" ? 0 : inputString.split(inputChar).length - 1;
  }

  /**
   * @param {array} stringArray : parsedArray ["packageName", "commandName", "arguments"]
   * @return {string} クエリを作成するためのAPIエンドポイントURLに付加される文字列。通常は、'<parameterName>=<parameterValue>&<parameterName>=<parameterValue>'の形式。
   */
  const queryStringFromParsedArray = (stringArray) => {
    // commandNameがisbn-lookupの場合、ISBNを付け加えて返す
    if(stringArray[1] == 'isbn-lookup') return `isbn=${stringArray[2]}`;
    // commandNameがsearchの場合、argumentのすべてのカンマは＆に置き換える
    else if(stringArray[1] == 'search') return stringArray[2].replace(",", "&");
    else{
      console.log("queryStringFromParsedArray: invalid command type");
      return;
    }
  }

  async function queryResponseObjectFromQueryString(queryString){
    let queryResponseObject = {};
    let queryURL = ConfigBTools.url + queryString;
    await fetch(queryURL).then(response=>response.json()).then(data=>queryResponseObject = data);
    appendResult(queryResponseObject);
  }

  const appendEcho = () => {
    let echo = (
      <p>
        <span style={{ color: "green" }}>{Config.userName}</span>
        <span style={{ color: "red" }}> @ </span>
        <span style={{ color: "pink" }}> {Config.deviceName} </span>
        : {input.value}
      </p>
    );
    setResArr([...resArr, echo]);
  }

  const appendError = () => {
    let echo = (
      <p>
        <span style={{ color: "green" }}>{Config.userName}</span>
        <span style={{ color: "red" }}> @ </span>
        <span style={{ color: "pink" }}> {Config.deviceName} </span>
        : {input.value}
      </p>
    );
    setInput({value: ''});
    let temp = (<p id="scroll-area"><span style={{ color: "red" }}>CLIError</span>: Invalid input. Must follow the specified format: [packageName] [commandName] [argument(s)] where packageName is "BTools", commandName is either "search" or "isbn-lookup", argument is author=? or title=?, and it must not contain more than 2 spaces.</p>);
    setResArr([...resArr, echo, temp])

    return;
  }

  const appendResult = (queryResponseObject) => {
    console.log(queryResponseObject);
    let echo = (
      <p>
        <span style={{ color: "green" }}>{Config.userName}</span>
        <span style={{ color: "red" }}> @ </span>
        <span style={{ color: "pink" }}> {Config.deviceName} </span>
        : {input.value}
      </p>
    );
    setInput({value: ''});
    if(queryResponseObject["docs"].length == 0) {
      let temp = (<p><span style={{ color: "skyblue" }}>OpenLibrary</span>: 0 matches</p>);
      setResArr([...resArr, echo, temp])
    }
    else{
      let len = queryResponseObject["docs"].length;
      console.log(queryResponseObject["docs"].length);
      let temp = (<p><span style={{ color: "skyblue" }}>OpenLibrary</span>: {len} matches</p>);
      let result = [];

      for(let docIndex = 0; docIndex < len; docIndex++){
        let queryResponseDocument = queryResponseObject["docs"][docIndex];
        let matchString = (<p><span style={{ color: "skyblue" }}>OpenLibrary</span>: [{docIndex+1}]
        author: {queryResponseDocument["author_name"]},
        title: {queryResponseDocument["title"]},
        first published: {queryResponseDocument["first_publish_year"]},
        key: {queryResponseDocument["key"]}
        </p>)

        let isbnString;
        queryResponseDocument.hasOwnProperty('isbn') == true ? isbnString = (<p>ISBN: {queryResponseDocument["isbn"][0]}</p>) : "";
        
        result.push(matchString, isbnString);
      }

      setResArr([...resArr, echo, temp, result]);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100vh" }} className={styles.btoolContainer}>
      <Head>
        <title>Open Library Book Search</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Spartan:wght@500&display=swap" rel="stylesheet" />
      </Head>
      <div>
        <h1 style={{ textAlign: "center", marginBottom: "0.8rem", marginTop: "0px" }}>Open Library Book Search</h1>
        <p style={{ textAlign: "center", color: "red", marginBottom: "2rem" }}>Queries can take a couple seconds</p>
      </div>
      <Container maxWidth="md" style={{ padding: "0px" }} className={styles.resultBackground}>

        {/* 1st section */}
        <div style={{ textAlign: "center", padding: "0.5rem" }} className={styles.headerBackground}>
          <h3 style={{ textAlign: "center"}}>Format: "BTools [command] [argument(s)]"</h3>
          <h3 style={{ textAlign: "center" }}>~ List of available commands and arguments ~</h3>
          <p>search [author=(?)<span style={{ color: "white", margin: "0rem 0.2rem" }}>or</span> title=(?)<span style={{ color: "white", margin: "0rem 0.2rem" }}>or</span>author=?,title=?], isbn-lookup [ISBN-number] </p>
          <h5>Examples: BTools search author=hawkings<span style={{ color: "white", margin: "0rem 0.2rem" }}>|</span> BTools search title=harry<span style={{ color: "white", margin: "0rem 0.2rem" }}>|</span> BTools isbn-lookup 6051067183</h5>
        </div>

        {/* 2nd section */}
        <Container style={{ height: "35vh", padding: "1rem", color: "white" }} className={styles.outputContainer} id={"scroll-area"}>
          {resArr}
        </Container>

        {/* 3rd section  */}
        <form noValidate>
          <TextField id="outlined-full-width" fullWidth variant="outlined" placeholder="type any commands" className={styles.textFieldBackground} value={input.value} onChange={handleChange} onKeyPress={handleKeyPress} />
        </form>
      </Container>
    </div>
  )
}

export default BToolPage

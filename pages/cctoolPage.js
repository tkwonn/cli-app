import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import {Container, TextField} from '@material-ui/core'
import styles from '../styles/Home.module.css'

import {Config} from '../config/index'
import {ConfigCCTools} from '../config/cctools'


const CCToolPage = () => {
  const [input, setInput] = useState({value: ''});
  const [resArr, setResArr] = useState([]);
  const access_key = '270bd7cf39532020b79e9304f7ffa16d';

  useEffect(() => {
    const scrollArea = document.getElementById('scroll-area');
    if(scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [resArr]);

  

  const handleKeyPress = (event) => {
    if(event.key == "Enter"){
      event.preventDefault();
      let parsedStringInputArray = commandLineParser(input.value);

      // validation
      let validatorResponse = parsedArrayValidator(parsedStringInputArray);
      if(!validatorResponse['isValid']) appendResult(false, validatorResponse['errorMessage']);
      // すべての入力検証に通過したら
      else {
        evaluatedResultsStringFromParsedArray(parsedStringInputArray);
      }
    }
  }

  async function getAPIData(parsedStringArray){
    let queryResponseObject = {};
    let queryURL = 'http://api.exchangeratesapi.io/v1/latest?access_key=' + access_key + '&symbols=AED,GBP,INR,JPY,KRW,USD,CAD,CNY,NZD';

    await fetch(queryURL).then(response=>response.json()).then(data=>queryResponseObject = data);
    console.log(parsedStringArray);
    console.log(queryResponseObject);
    
    if(parsedStringArray[1] == "showCurrentRate"){
      let targetCurrency = parsedStringArray[2];
      let res = queryResponseObject["rates"][targetCurrency].toString();
      appendResult(true, res);
    }
    else if(parsedStringArray[1] == "convert"){
      let targetCurrency = parsedStringArray[3];
      let rateNum = queryResponseObject["rates"][targetCurrency];
      let res = Number(parsedStringArray[2]) * rateNum;
      // 小数点第三位で切り捨て
      res = Math.floor(res*100)/100;
      appendResult(true, res.toString());
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
   * @param {array} stringArray
   * @return {Associative array}
   * @validation universalValidator & argumentsValidator
   */
  const parsedArrayValidator = (stringArray) => {
    let validatorResponse = universalValidator(stringArray);
    if(!validatorResponse['isValid']) return validatorResponse;

    validatorResponse = argumentsValidator(stringArray.slice(1));
    if(!validatorResponse['isValid']) return validatorResponse;

    return {'isValid': true, 'errorMessage': ''}
  }

  /**
   * @param {array} stringArray
   * @return {Associative array}
   * @rules First token must start with CCTools, Second token must be selected from valid commands
   */
  const universalValidator = (stringArray) => {
    if(stringArray[0] != "CCTools") return {'isValid': false, 'errorMessage': "Only CCTools package supported by this app. Input must start with 'CCTools' "}
    if(!ConfigCCTools.validCommandList.includes(stringArray[1])) {
      const validCommands = ConfigCCTools.validCommandList.join(",");
      return {'isValid': false, 'errorMessage': "CCTools only supports the following commands: " + validCommands}
    }

    return {'isValid': true, 'errorMessage': ''}
  }

  /**
   * @param {array} commandArgsArray
   * @return {Associative array}
   */
  const argumentsValidator = (commandArgsArray) => {

    if(ConfigCCTools.zeroArgumentCommand.includes(commandArgsArray[0])) return zeroArgValidator(commandArgsArray.slice(1), commandArgsArray);
    if(ConfigCCTools.singleArgumentCommand.includes(commandArgsArray[0])) return singleArgValidator(commandArgsArray.slice(1), commandArgsArray);
    if(ConfigCCTools.doubleArgumentsCommand.includes(commandArgsArray[0])) return doubleArgValidator(commandArgsArray.slice(1), commandArgsArray);
  }

  /**
   *  @rules Must not have an argument.
   */
  const zeroArgValidator = (argsArray, commandArgsArray) => {
    if(argsArray.length != 0) return {'isValid': false, 'errorMessage': "Command " + commandArgsArray[0] + " must not have an argument"};
    return {'isValid': true, 'errorMessage': ''};
  }

  /**
   *  @rules Requires 1 argument and limited locations 
   */
  const singleArgValidator = (argsArray, commandArgsArray) => {
    if(argsArray.length != 1) return {'isValid': false, 'errorMessage': "Command " + commandArgsArray[0] + " requires exactly 1 argument"};
    if(!ConfigCCTools.validDenominationList.includes(argsArray[0])) {
      const validDenomination = ConfigCCTools.validDenominationList.join(",");
      return {'isValid': false, 'errorMessage': "CCTools only supports the following currencies: " + validDenomination};
    }

    return {'isValid': true, 'errorMessage': ''};
  }

  /**
   *  @rules Requires 3 arguments, limited denominations, and second argument must be a positive number
   */
  const doubleArgValidator = (argsArray, commandArgsArray) => {
    console.log(argsArray, commandArgsArray);
    if(argsArray.length != 2) return {'isValid': false, 'errorMessage': "Command " + commandArgsArray[0] + " requires exactly 2 arguments, i.e., [Amount] [Currency I want]"};
    if(!ConfigCCTools.validDenominationList.includes(argsArray[1])) return {'isValid': false, 'errorMessage': "This currency is not supported"};
    
    let parsedNum = Number(argsArray[0]);
    if((typeof parsedNum !== "number") || isNaN(parsedNum) || parsedNum <= 0) return {'isValid': false, 'errorMessage': "Amount must be a positive number"} 

    return {'isValid': true, 'errorMessage': ''}
  }

  /**
   * @param {array} stringArray : parsedStringArray
   * @return {string} 計算結果
   */
  const evaluatedResultsStringFromParsedArray = (stringArray) => {
    if(stringArray[1] == "showAvailableCurrencies") addAvialableCurrencyToResult();
    else if(stringArray[1] == "showCurrentRate") getAPIData(stringArray);
    else if(stringArray[1] == "convert") getAPIData(stringArray);
    else console.log("evaluatedResultsStringFromParsedArray: invalid input");

    return;
  }

  const addAvialableCurrencyToResult = () => {
    let output = (<div><p>AED (UAE Dirham)</p><p>GBP (United Kingdom Pound Sterling)</p><p>INR (Indian Rupee)</p><p>JPY (Japanese Yen)</p><p>KRW (South Korean Won)</p><p>USD (United State Dollar)</p><p>CAD (Canadian Dollar)</p><p>CNY (Chinese Renminbi)</p><p>NZD (New Zealand Dollar)</p></div>);
    appendResult(true, output);
    return;
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
      let temp = (<p id="scroll-area"><span style={{ color: "skyblue" }}>CCTools</span>: Your result is: {output}</p>);
      setResArr([...resArr, echo, temp])
    }
    else{
      let temp = (<p id="scroll-area"><span style={{ color: "red" }}>CCToolsError</span>: {output}</p>);
      setResArr([...resArr, echo, temp])
    }
    return;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100vh" }} className={styles.cctoolContainer}>
      <Head>
        <title>Currency Convert</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Spartan:wght@500&display=swap" rel="stylesheet" />
      </Head>
      <div>
        <h1 style={{ textAlign: "center", marginBottom: "0.8rem", marginTop: "0px" }}>Currency Convert</h1>
        <p style={{ textAlign: "center", color: "red", marginBottom: "2rem" }}>Only EUR is supported as a base currency</p>
      </div>
      <Container maxWidth="md" style={{ padding: "0px" }} className={styles.resultBackground}>

        {/* 1st section */}
        <div style={{ textAlign: "center", padding: "0.5rem" }} className={styles.headerBackground}>
          <h3 style={{ textAlign: "center"}}>Format: CCTools [command] (optional argument)</h3>
          <h3 style={{ textAlign: "center" }}>~ List of available commands ~</h3>
          <p>showAvailableCurrencies, showCurrentRate [Currency I want], convert [amount] [Currency I want]</p>
          <h5>Example: CCTools showAvailableCurrencies <span style={{ color: "white", margin: "0rem 0.5rem" }}> |</span>CCTools showCurrentRate USD<span style={{ color: "white", margin: "0rem 0.5rem" }}> |</span>CCTools convert 100 USD</h5>
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

export default CCToolPage

import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import {Container, TextField} from '@material-ui/core'
import styles from '../styles/Home.module.css'

import {Config} from '../config/index'
import {ConfigCCTools} from '../config/cctools'


const CCToolPage = () => {
  const [input, setInput] = useState({value: ''});
  const [resArr, setResArr] = useState([]);

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
    if(ConfigCCTools.tripleArgumentsCommand.includes(commandArgsArray[0])) return tripleArgValidator(commandArgsArray.slice(1), commandArgsArray);
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
    let validLocalesList = [];
    ConfigCCTools.validCurrencyList.forEach(element => {
      if(!validLocalesList.includes(element.locale)) validLocalesList.push(element.locale);
    })
    if(!validLocalesList.includes(argsArray[0])) {
      return {'isValid': false, 'errorMessage': "CCTools only supports the following currencies: " + validLocalesList.join(" ")};
    }

    return {'isValid': true, 'errorMessage': ''};
  }

  /**
   *  @rules Requires 3 arguments, limited denominations, and second argument must be a positive number
   */
  const tripleArgValidator = (argsArray, commandArgsArray) => {
    console.log(argsArray, commandArgsArray);
    if(argsArray.length != 3) return {'isValid': false, 'errorMessage': "Command " + commandArgsArray[0] + " requires exactly 3 arguments. [Currency I have] [Amount] [Currency I want]"};
    let validDenominationsList = [];
    ConfigCCTools.validCurrencyList.forEach(element => {
      if(!validDenominationsList.includes(element.denomination)) validDenominationsList.push(element.denomination);
    })
    if(!validDenominationsList.includes(argsArray[0])) return {'isValid': false, 'errorMessage': "This 1st currency is not supported"};
    if(!validDenominationsList.includes(argsArray[2])) return {'isValid': false, 'errorMessage': "This 2nd currency is not supported"};
    
    let parsedNum = Number(argsArray[1]);
    if((typeof parsedNum !== "number") || isNaN(parsedNum) || parsedNum <= 0) return {'isValid': false, 'errorMessage': "Amount must be a positive number"} 

    return {'isValid': true, 'errorMessage': ''}
  }

  /**
   * @param {array} stringArray : parsedStringArray
   * @return {string} 計算結果
   */
  const evaluatedResultsStringFromParsedArray = (stringArray) => {
    if(stringArray[1] == "showAvailableLocales") addAvialableLocaleToResult();
    else if(stringArray[1] == "showDenominations") showDenominationsToResult(stringArray[2]);
    else if(stringArray[1] == "convert") addConversionToResult(stringArray[2], stringArray[3], stringArray[4]);
    else console.log("evaluatedResultsStringFromParsedArray: invalid input");

    return;
  }

  const addAvialableLocaleToResult = () => {
    let output = [];
    ConfigCCTools.validCurrencyList.forEach(element => {
      if(!output.includes(element.locale)) output.push(element.locale);
    })
    appendResult(true, output.join(" "));
    return;
  }

  const showDenominationsToResult = (locale) => {
    let output = [];
    ConfigCCTools.validCurrencyList.forEach(element => {
      if(element.locale == locale) output.push(element.denomination);
    })
    appendResult(true, output.join(", "));
    return;
  }

  const addConversionToResult = (sourceCurrency, amount, destinationCurrency) => {
    console.log(sourceCurrency, amount, destinationCurrency);
    let sourceRate;
    let destinationRate;
    ConfigCCTools.validCurrencyList.forEach(element => {
      if(element.denomination === sourceCurrency) sourceRate = element.exchangeRateJPY;
      if(element.denomination === destinationCurrency) destinationRate = element.exchangeRateJPY;
    })
    let result = Math.floor((sourceRate * Number(amount)) * 100 / destinationRate) / 100;
    appendResult(true, result + " " + destinationCurrency);
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
        <h1 style={{ textAlign: "center", marginBottom: "2.5rem", marginTop: "0px" }}>Currency Convert</h1>
      </div>
      <Container maxWidth="md" style={{ padding: "0px" }} className={styles.resultBackground}>

        {/* 1st section */}
        <div style={{ textAlign: "center", padding: "0.5rem" }} className={styles.headerBackground}>
          <h3 style={{ textAlign: "center"}}>Format: CCTools [command] (optional argument)</h3>
          <h3 style={{ textAlign: "center" }}>~ List of available commands ~</h3>
          <p>showAvailableLocales, showDenominations [locale], convert [Currency I have] [amount] [Currency I want]</p>
          <h5>Example: CCTools showAvailableLocales <span style={{ color: "white", margin: "0rem 0.5rem" }}> |</span>CCTools showDenominations India<span style={{ color: "white", margin: "0rem 0.5rem" }}> |</span>CCTools convert Rupee 100 Dollar</h5>
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

import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import {Container, TextField} from '@material-ui/core'
import styles from '../styles/Home.module.css'

import {Config} from '../config/index'
import {ConfigMTools} from '../config/mtools'

const MToolPage = () => {
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
        appendResult(true, calculateArrayElements(parsedStringInputArray));
      }
    }
  }

  const handleChange = (event) => {
    event.preventDefault();
    setInput({value: event.target.value});
  }

  /**
   * @param {string} inputString : MTools add 3,4 
   * @return {array} ["MTools", "add", "3,4"]
   */
  const commandLineParser = (inputString) => {
    let parsedStringInputArray = inputString.trim().split(" ");
    return parsedStringInputArray;
  }

  /**
   * @param {array} stringArray : ["MTools", "add", "3,4"]
   * @return {Associative array} : {'isValid': Boolean, 'errorMessage': String } 
   * @validation universalValidator & argumentsValidator
   */
  const parsedArrayValidator = (stringArray) => {
    let validatorResponse = universalValidator(stringArray);
    if(!validatorResponse['isValid']) return validatorResponse;

    validatorResponse = argumentsValidator(stringArray.slice(1,3));
    if(!validatorResponse['isValid']) return validatorResponse;

    return {'isValid': true, 'errorMessage': ''}
  }

  /**
   * @param {array} stringArray : ["MTools", "add", "3,4"]
   * @return {Associative array} : {'isValid': Boolean, 'errorMessage': String } 
   * @rules The amount of token must be 3, First token must start with MTools, Second token must be selected from valid operators, Third token must be numbers and comma
   */
  const universalValidator = (stringArray) => {
    if(stringArray[0] != "MTools") return {'isValid': false, 'errorMessage': "Only MTools package supported by this app. Input must start with 'MTools' "}
    if(stringArray.length != 3) return {'isValid': false, 'errorMessage': "Command line input must contain exactly 3 elements: 'packageName commandName arguments' "}
    if(!ConfigMTools.validOperatorList.includes(stringArray[1])) {
      const validOperators = ConfigMTools.validOperatorList.join(",");
      return {'isValid': false, 'errorMessage': "MTools only supports the following commands: " +  validOperators}
    }
    if(!isAllNumbers(stringArray[2].split(","))) return {'isValid': false, 'errorMessage': "Last element of command line input must only contain number or numbers and comma"}

    return {'isValid': true, 'errorMessage': ''}
  }

  /**
   * @param {array} commandArgsArray : ["add", "3,4"] or ["sqrt", "25"]
   * @return {Associative array} : {'isValid': Boolean, 'errorMessage': String } 
   * @rules If argument was [abs, round, ceil, floor,, sqrt] it only requires 1 argument, otherwise 2 arguments
   * If second token was divide, argArray's second argument must not be 0, if second token was log, argArray's first argument must be bigger than 1 and second argument must be positive number
   * 
   */
  const argumentsValidator = (commandArgsArray) => {
    let intArray = commandArgsArray[1].split(",").map(stringElement => Number(stringElement));

    if(ConfigMTools.singleArgumentCommands.includes(commandArgsArray[0])) return singleArgValidator(commandArgsArray[0], intArray);
    if(ConfigMTools.doubleArgumentsCommands.includes(commandArgsArray[0])) return doubleArgValidator(commandArgsArray[0], intArray);
  }

  /**
   * @param {string} operator : "sqrt"
   * @param {array} intArray : [3, 4] or [0] or [25]
   * @return {Associative array} : {'isValid': Boolean, 'errorMessage': String } 
   * @rules intArray must only contain 1 element, if operator is sqrt, intArray's element must not be negative number
   */
  const singleArgValidator = (operator, intArray) => {
    if(intArray.length != 1) return {'isValid': false, 'errorMessage': "Command " + operator + " requires exactly 1 argument"};
    if(operator == "sqrt" && intArray[0] < 0) return {'isValid': false, 'errorMessage': "Command " + operator + " only supports arguments with value >= 0"};

    return {'isValid': true, 'errorMessage': ''};
  }

  const doubleArgValidator = (operator, intArray) => {
    if(intArray.length != 2) return {'isValid': false, 'errorMessage': "Command " + operator + " requires exactly 2 arguments"};
    if(operator == "divide" && intArray[1] == 0) return {'isValid': false, 'errorMessage': "Command " + operator + " requires divisors != 0"};
    if(operator == "log" && intArray[0] < 1) return {'isValid': false, 'errorMessage': "Command " + operator + " requires a base > 1"}
    if(operator == "log" && intArray[1] < 1) return {'isValid': false, 'errorMessage': "Command " + operator + " requires a positive antilogarithm"}

    return {'isValid': true, 'errorMessage': ''}
  }

  /**
   * @param {array} argsArray : ["3", "4"]
   * @return {boolean} True if all element in array are number, otherwise false
   * @caution Number("one") will return NaN and NaN is considered as number
   */
  const isAllNumbers = (argsArray) => {
    return argsArray.reduce((isNumber, currElement) => {
      let parsedNum = Number(currElement);
      return isNumber && (typeof parsedNum == "number") && !isNaN(parsedNum);
    }, true);
  }

  /**
   * @param {array} stringArray : parsedStringArray
   * @return {string} 計算結果
   */
  const calculateArrayElements = (stringArray) => {
    let result = 0;
    let strArray = String(stringArray[2]).split(",");
    let intArray = strArray.map(stringElement => Number(stringElement));
    let arg1 = intArray[0];
    let arg2 = intArray[1];

    switch(stringArray[1]){
      case "add": result = arg1 + arg2; break;
      case "subtract": result = arg1 - arg2; break;
      case "multiply": result = arg1 * arg2; break;
      case "divide": result = arg1 / arg2; break;
      case "exp": result = Math.pow(arg1, arg2); break;
      case "log": result = Math.log(arg2) / Math.log(arg1); break;
      case "sqrt": result = Math.sqrt(arg1); break;
      case "abs": result = Math.abs(arg1); break;
      case "round": result = Math.round(arg1); break;
      case "ceil": result = Math.ceil(arg1); break;
      case "floor": result = Math.floor(arg1); break;
      default: console.log("calculateArrayElements: invalid command name"); break;
    }

    return "Your result is: " + result;
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
      let temp = (<p id="scroll-area"><span style={{ color: "skyblue" }}>MTools</span>: {output}</p>);
      setResArr([...resArr, echo, temp])
    }
    else{
      let temp = (<p id="scroll-area"><span style={{ color: "red" }}>MToolsError</span>: {output}</p>);
      setResArr([...resArr, echo, temp])
    }
    return;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100vh" }} className={styles.mathtoolContainer}>
      <Head>
        <title>Math tools</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Spartan:wght@500&display=swap" rel="stylesheet" />
      </Head>
      <div>
        <h1 style={{ textAlign: "center", marginBottom: "2.5rem", marginTop: "0px" }}>Math Tools</h1>
      </div>
      <Container maxWidth="md" style={{ padding: "0px" }} className={styles.resultBackground}>

        {/* 1st section */}
        <div style={{ textAlign: "center", padding: "0.5rem" }} className={styles.headerBackground}>
          <h3>Format: MTools [operator] [Number], [Number]</h3>
          <h3 style={{ textAlign: "center" }}>~ List of available operators ~</h3>
          <p>[ add, subtract, multiply, divide, exp, log, abs, sqrt, round, floor, ceil ]</p>
          <h3>Example: MTools add 4,5 <span style={{ color: "white", margin: "0rem 0.8rem" }}>or</span> MTools sqrt 25</h3>
        </div>

        {/* 2nd section */}
        <Container style={{ height: "35vh", padding: "1rem", color: "white" }} className={styles.outputContainer} id={"scroll-area"}>
          {resArr}
        </Container>

        {/* 3rd section  */}
        <form noValidate autoComplete="off">
          <TextField id="outlined-full-width" fullWidth variant="outlined" placeholder="type any commands" className={styles.textFieldBackground} value={input.value} onChange={handleChange} onKeyPress={handleKeyPress} />
        </form>
      </Container>
    </div>
  )
}

export default MToolPage

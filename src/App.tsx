import React from 'react';
import logo from './home.png';
import './App.css';

import { useState, useEffect } from 'react';
import { createCaptcha } from "freecaptcha";
import axios from "axios";
import { createGuildClient, createSigner } from "@guildxyz/sdk";
import { Octokit } from 'octokit';

declare global {
  interface Window {
    keplr?: any;
    leap?: any;
    cosmostation?: any;
  }
}

function App() {
  const [addr, setAddr] = useState('');
  const [hexAddr, setHexAddr] = useState('');
  const [capKey, setCapKey] = useState('');
  const [lastGen, setLastGen] = useState('');
  const [accessVal, setAccessVal] = useState('');
  const [codeVal, setCodeVal] = useState('');

  useEffect(() => {
    async function checkDiscord() {
      var url = window.location.toString();
      var queryString = "";
      var access_token = "";
      if (url.length > 25 && url.indexOf('#') != -1){
        queryString = url.substring(url.indexOf('#') + 1);
        access_token = queryString.substring(31,61);
        setAccessVal(access_token);
      }
      else {
        console.log('not a discord check flow');
        return;
      }
      console.log("access token: ".concat(access_token));
      if (access_token.length > 2){
        const url2 = 'https://discord.com/api/v10/oauth2/@me';
        const response = await fetch(url2, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data.user.id);
          console.log(data.user.username);

        } else {
          throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`);
        }
      }


    }
    async function checkGithub() {
      var url = window.location.toString();

      var code = "";
      if (url.length > 40 && url.indexOf('code') != -1){
        code = url.substring(url.indexOf('code') + 5);
        setCodeVal(code);
        console.log("github code: ".concat(code));

      }
      else {
        console.log('not a github check flow');
        return;
      }
      if (code.length > 2){
        try{
          const data = {
            code: code,
          }
          console.log(data);
          const response = await axios.post("https://gm-serve3.onrender.com/api/secret/github", {
            data: data,
        });
        console.log(response.data);
        var toke = response.data.token;
        const octokit = new Octokit({ auth: toke });
        const usr = await octokit.request("GET /user");
        console.log(usr);


        }
        catch (err){
          console.log(err);
        }
      }
      console.log('Successful Fetch');

    }

    checkDiscord();
    checkGithub();
  }, [])





  
  const GenerateCaptcha = async () => {
    console.log('hi');
    var el = document.getElementById('captcha')! as HTMLCanvasElement;
    var captcha_val = createCaptcha(el);
    console.log(captcha_val);
    setCapKey(captcha_val);
    localStorage.setItem("cap_key", captcha_val);
    const now = Date.now();
    setLastGen(now.toString());
  }
 


  const MouseAuth = async () => {
    try{
      const response = await axios.post("https://gm-serve3.onrender.com/api/secret/mouse", {
        data: null,
    });
    console.log(response.data.mouseHuman);
    if (response.data.mouseHuman){
      document.getElementById("mouse_area")!.innerHTML = `<br/><br/>
        <div style="color: pink; font-size: .6em;">Congratulations. Your mouse movement based authentication is
        successfully completed. Captcha authentication is one of the steps Secret Mission App requires
        to generate your successful Proof of Humanity (PoH) authorization.</div>
        <br/><br/>`;
        document.getElementById('mv')!.style.display = 'none';
      return 1;
    }
    else {
      return 0;
    }
  }

    catch (err){
      console.log(err);
      return 0;
    }
  }

  const CaptchaAuth = async () => {
    const now = Date.now();
    var gen_time = lastGen;
    var el = document.getElementById("captchaTextBox")! as HTMLInputElement;
    var input_val = el.value;

    if (gen_time == ''){
      console.log('no captcha generated');
      GenerateCaptcha();
      el.value = '';
      return;
    }

    const last_gen = Number(gen_time);
    console.log(now - last_gen);
    if (now - last_gen > 30000){
      console.log('timed out captcha');
      document.getElementById('cap_resp')!.textContent = 'Timed Out!';
      GenerateCaptcha();
      el.value = '';
    }
    var captcha_val = capKey;

    console.log(captcha_val);
    console.log(input_val);
    if (input_val == captcha_val){
      console.log('true');
      document.getElementById('cap_resp')!.textContent = 'Success!';
      document.getElementById('cap_area')!.innerHTML = '';
    }
    else {
      console.log('false');
      document.getElementById('cap_resp')!.textContent = 'Captcha Mismatch!';
      GenerateCaptcha();
      el.value = '';
    }
  }

  const GithubAuth = async () => {
    window.location.href = 'https://github.com/login/oauth/authorize?client_id=Ov23linZL075zZj0rjHz&redirect_uri=https://scrtmission.netlify.app/&scope=read:user';
  }

  const DiscordAuth = async () => {
    window.location.href = 'https://discord.com/oauth2/authorize?client_id=1256147573761114135&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&scope=identify';
  }



  



  const Login = async (code: string) => {
    if (code == 'keplr'){
      if (!window.keplr) {
          throw ("Please install keplr extension");
      } else {
          try {
              const chainId = "cosmoshub-4";

              await window.keplr.enable(chainId);

              const offlineSigner = window.keplr.getOfflineSigner(chainId);

              const accounts = await offlineSigner.getAccounts();
              console.log(accounts[0].address);

          } catch (err){
              console.log(err);
          }
      }
    }
    else if (code == 'leap'){
      if (!window.leap) {
          throw ("Please install leap extension");
      } else {
          try {
              const chainId = "cosmoshub-4";

              await window.leap.enable(chainId);

              const offlineSigner = window.leap.getOfflineSigner(chainId);

              const accounts = await offlineSigner.getAccounts();
              console.log(accounts[0].address);

          } catch (err){
              console.log(err);
          }
      }
    }
    else if (code == 'cmstn'){
      if (!window.cosmostation) {
          throw ("Please install cosmostation extension");
      } else {
          try {
              const chainId = "cosmoshub-4";
              const account = await window.cosmostation.cosmos.request({
                  method: "cos_requestAccount",
                  params: { chainName: chainId },
                });
              console.log(account.address);

          } catch (err){
              console.log(err);
          }
      }
    }
    else {
      console.log('invalid code');
      return;
    }




  }
  
  

  return (
    <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          
          <a
            className="App-link"
            href="https://secretverse.medium.com"
            target="_blank"
            rel="noopener noreferrer"
          > <br/>
            Secret Mission Demo
          </a>
          <br/>

          <a onClick={()=>Login('keplr')} style={{"cursor":'pointer'}}> Keplr Login </a>
          <a>--------------------------------------------</a>
          <a onClick={()=>Login('leap')} style={{"cursor":'pointer'}}> Leap Login </a>
          <a>--------------------------------------------</a>
          <a onClick={()=>Login('cmstn')} style={{"cursor":'pointer'}}> Cosmostation Login </a>
          <a>--------------------------------------------</a>
          <a id="mv" onClick={MouseAuth} style={{"cursor":'pointer'}}> Mouse Based Verification </a>
          <div id="mouse_area"></div>
          <a>--------------------------------------------</a>
          <a onClick={GenerateCaptcha} style={{"cursor":'pointer'}}> Captcha Based Verification </a>
          <div id="cap_area">
            <div>Fill in the Order: White - Blue - Red</div>
            <div>Ignore All Other Colors</div>



            <br/>

            <br/> <br/>
            <canvas id="captcha" width="200" height="100"></canvas>
            <form id="cap_form">

              <input type="text" placeholder="Captcha" id="captchaTextBox" height="120"/>
              <button type="button"  onClick={CaptchaAuth}>Submit</button>
            </form>
          </div>
          <div id="cap_resp" style={{"fontSize": ".6em"}}></div>
          <a>--------------------------------------------</a>
          <a onClick={DiscordAuth} style={{"cursor":'pointer'}}> Discord Verification </a>
          <a>--------------------------------------------</a>
          <a onClick={GithubAuth} style={{"cursor":'pointer'}}> GitHub Verification </a>
        <a>--------------------------------------------</a>
        </header>
    </div>
  );
}

export default App;

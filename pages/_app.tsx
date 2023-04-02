import "./App.css";
import type { AppProps } from 'next/app';
import { Configuration, OpenAIApi } from "openai";
import getConfig from "next/config";
import {useState, useEffect} from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [result, setResult] = useState("https://media.npr.org/assets/img/2016/09/04/ape_wide-25eb06b03a10a8e4e02df2d68478371bbb315d75-s1200-c85.webp");
  const [prompt, setPrompt] = useState("");
  const { publicRuntimeConfig } = getConfig();
  const [loader, setLoader] = useState(false);
  const [typedText, setTypedText] = useState('');
  const loadingText = 'Supercalifragilisticexpialidocious!'
  const apiKey = (typeof publicRuntimeConfig !== 'undefined' && publicRuntimeConfig.apiKey)? publicRuntimeConfig.apiKey : process.env.API_KEY;
  
  console.log(apiKey);

  if (!apiKey) {
    throw new Error("API Key not found!");
  }
  const configuration = new Configuration({apiKey});
  const openai = new OpenAIApi(configuration);

  const generateImage = async () => {
    setLoader(true);
    const res = await openai.createImage({
      prompt : prompt,
      n : 1,
      size : "1024x1024"}
    )
    const data  = res.data;
    setLoader(false);
    setResult(data.data[0].url || 'no image found');
  }

  
  useEffect(() => {
    if (loader) {
      let i = 0;
      const typing = setInterval(() => {
        setTypedText(loadingText.slice(0,i));
        i++;
        if (i > loadingText.length + 1) {
          i = 0;
          setTypedText('');
        }
      }, 150);
      return () => clearInterval(typing);
    }
  }, [loader])
  const sendEmail = (url = "") => {
    const message = `Here is your image download link: ${url}`;
    window.location.href = `mailto:someone@example.com?subject=Your Image Download Link&body=${message}`;
  }
  return <div className="app-main">
    <h2>
      Create Images with your imagination!
    </h2>
    <textarea
      className="app-input"
      placeholder="Type anything you can imagine!"
      onChange={(e) => setPrompt(e.target.value)}
    />
    <button onClick={generateImage}>Generate Image</button>
    <>{loader? (
    <>
      <h3>{typedText}</h3>
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
      </>
      )
      :<img src={result} onClick={() => sendEmail(result)} style={{cursor:"pointer"}} className="result-image" alt="Placeholder Image" />
      }
    </>
  </div>
}

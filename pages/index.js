import { useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import codieLogo from '../assets/codie-logo.png';
import codie2Logo from '../assets/codie2-logo.png';
import trueloveLogo from '../assets/truelove-logo.png';
import { useState } from 'react';

const Home = () => {
  const [userInput, setUserInput] = useState('');
  const [lyrics, setLyrics] = useState([]);
  const [currentLine, setCurrentLine] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [playing, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [volume, setVolume] = useState(0.3);

  const imageStyle = {
    margin: 10,
  }

  const callGenerateEndpoint = async () => {
    setIsGenerating(true);

    console.log('Calling OpenAI...');
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    });

    const data = await response.json();
    const { output } = data;
    console.log('OpenAI replied...', output.text);

    // If the line has less than two words, remove it:
    const finalOutput = output.text
      .split('\n')
      .filter((line) => !line.includes('Verse'))
      .filter((line) => !line.includes('Chorus'))
      .filter((line) => !line.includes(':'))
      .filter((line) => line.split(' ').length > 2)
      //.slice(0, 12)
      .join('\n');

    setIsGenerating(false);
    handleSpeak(finalOutput);
  };

  const playTTS = async (text) => {
    const response = await fetch(`/api/textToSpeech`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    console.log("started streaming audio")
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    // Adjust playback speed
    audio.playbackRate = 1.3;
    audio.play();
  };

  const handleSpeak = (text) => {
    console.log('handleSpeak', text);
    let lines = text.split('\n');
    setIsPlaying(true)
    audio.play();

    // Display each line as it's played
    lines.forEach((line) => {
      let msg = new SpeechSynthesisUtterance(line);
      msg.rate = 1.3;
      msg.onstart = () => {
        setCurrentLine(line);
        if(index === 0){
          audio.volume = 0.2;
          audio.play();
        }
      };
      // Display current line
      msg.onstart = () => setCurrentLine(line);

      // When the last line is spoken, set the complete lyrics with line breaks
      if (line === lines[lines.length - 1]) {
        msg.onend = () => {
          setLyrics(text);
          setIsPlaying(false)
          setCurrentLine('');
          audio.pause();
        }
      }

      window.speechSynthesis.speak(msg);
    });
  };
    
  const stopPlaying = () =>{
    window.speechSynthesis.cancel();
    setIsPlaying(false)
    audio.pause();
  }

  useEffect(() => {
    if (audio) {
        audio.volume = volume;
    }
  }, [audio, volume]);

  const replay = () => {
    setIsPlaying(true)
    audio.play();

    music.currentTime = 0;
    tts.currentTime = 0;
    
    tts.play();
    music.play();
  };

  const onUserChangedText = (event) => {
    setUserInput(event.target.value);
  };

  return (
    <div className="root">
      <Head>
        <title>CODIE | buildspace </title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1 style={{textShadow: "#800080"}}>CODIE: God's Gift to Dustin</h1>
          </div>
          <div classname="logo-container">
          <Image style={imageStyle} src={codieLogo} alt="Pretty girl" />
          <Image style={imageStyle} src={codie2Logo} alt="Pretty girl" />
          <Image style={imageStyle} src={trueloveLogo} alt="Pretty girl" />
          </div>
          <div className="header-subtitle">
            <h2>Digging in Codie's guts like a gardner, If she starts screaming i'ma dig a little harder</h2>
          </div>
        </div>
        <audio
          src={`/nobody.mp3`}
          onCanPlay={(e) => e.target.volume = 0.2}

          ref={(el) => { setAudio(el); }}
        />
        <div className="prompt-container">
          <textarea
            placeholder="Hello how much does Dustin like you? just ask?"
            className="prompt-box"
            value={userInput}
            onChange={onUserChangedText}
          />
                  <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
        />
          {/* Temporary button for calling requestSpeechFile to test */}
          {/* <button onClick={() => playTTS(userInput)}>Test voice</button> */}

          <div className="prompt-buttons">
            <a
              className={
                isGenerating ? 'generate-button loading' : 'generate-button'
              }
              onClick={callGenerateEndpoint}
            >
              <div className="generate">
                {isGenerating ? (
                  <span className="loader"></span>
                ) : (
                  <p>Woo Me</p>
                )}
              </div>
            </a>
          </div>

          {/* Button that is visible if text-to-speech is playing that calls stop function */}  
          {playing && (
            <div className="prompt-buttons">
              <a className="generate-button" onClick={stopPlaying}>
                <div className="generate">
                  <p>Stop i'm wet</p>
                </div>
              </a>
            </div>
          )}

       
          

          <div className="output">
            <div className="output-header-container">
              <div className="output-header">
                <h3>{currentLine}</h3>
              </div>
              <div className="output-content">
                <p> {lyrics} </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="badge-container grow">
        <a
          href="https://www.buymeacoffee.com/guttermademedia" target="_blank" rel="noreferrer">
          <div className="badge">
            <p>Help me build this project</p>
          </div>
          <script src="https://unpkg.com/react-router-dom/umd/react-router-dom.min.js"></script>
        </a>
      </div>
    </div>
  );
};

export default Home;

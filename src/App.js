import './App.css';
import './styles/file_reader.css'
import { useEffect, useState } from 'react';
import get from './service';
import { ALL_ADVANCEMENTS } from './utils';
import AdvancementList from './components/AdvancementList';
import About from './components/About';
import FileInfo from './components/FileInfo'

function App() {
  const [completedAdvancements, setCompletedAdvancements] = useState({})
  const [userAdvancements, setUserAdvancements] = useState(null)
  const [
    missingProgressInAdvancements,
    setMissingProgressInAdvancements
  ] = useState(null)

  useEffect(() => {
    async function getCompletedAdvancements() {
      const advancements = await get('completed.json')
      setCompletedAdvancements(advancements)
    }
    getCompletedAdvancements()
  }, [])

  const fileChange = (event) => {
    const file = event.target.files[0]
    if (fileTypeIsJSON(file)) {
      tryParsingFile(file)
    } else {
      console.error('invalido!')
    }
  }

  function fileTypeIsJSON(userFile) {
    return userFile.type === 'application/json'
  }

  function tryParsingFile(userFile) {
    const fileReader = new FileReader()
    fileReader.readAsText(userFile)
    fileReader.onload = () => {
      const uploadedAdvancements = JSON.parse(fileReader.result)
      const uploadedAndRemovedAdvancements = removeUnusedAdvancements(uploadedAdvancements)
      setUserAdvancements(uploadedAndRemovedAdvancements)
    }
    fileReader.onerror = () => {
      console.error('error parsing!')
    }
  }

  function removeUnusedAdvancements(uploadedAdvancements) {
    const cleanAdvacements = {}
    ALL_ADVANCEMENTS.forEach(advancementName => {
      if (uploadedAdvancements[advancementName] === undefined) {
        cleanAdvacements[advancementName] = {}
      } else {
        cleanAdvacements[advancementName] = uploadedAdvancements[advancementName].criteria
      }
    })
    return cleanAdvacements
  }

  useEffect(() => {
    function getMissingAdvancements() {
      const missing = {}
      ALL_ADVANCEMENTS.forEach((advancementName) => {
        const userProgressInAdvancement = userAdvancements[advancementName]
        missing[advancementName] = getMissingFromAdvancement(advancementName, userProgressInAdvancement)
      })
      setMissingProgressInAdvancements(missing)
    }

    function getMissingFromAdvancement(advancementName, progress) {
      const missing = []
      for (const name in completedAdvancements[advancementName].criteria) {
        if (!(name in progress)) {
          missing.push(name)
        }
      }
      return missing
    }

    if (userAdvancements != null)
      getMissingAdvancements()
  }, [userAdvancements, completedAdvancements])

  return (
    < div>
      <div className='panel'>
        <About />
      </div>

      <div className='panel'>
        <FileInfo />
        <div className='file-reader'>
          <input type="file"
            onChange={fileChange}
            className='input-file'
          />
        </div>
        <AdvancementList missingProgressInAdvancements={missingProgressInAdvancements} />
      </div>
    </div >
  );
}

export default App;

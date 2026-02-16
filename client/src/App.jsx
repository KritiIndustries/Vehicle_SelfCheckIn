

import './App.css'
import LocationPermission from './components/Driver/LocationPermission'

function App() {


  return (
    <>

      <LocationPermission onAllow={() => console.log("Location permission granted")} onDeny={() => console.log("Location permission denied")} />

    </>
  )
}

export default App

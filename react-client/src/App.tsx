import {Auth} from "./screens/auth"
// import { boards} from "./screens/boards"
// import {dashboard} from "./screens/dashboard"
// import {issues} from "./screens/isssues"
// import{issueMember} from "./screens/issuuesmember"
// import {myorg} from "./screens/myorg"
// import{onboarding} from "./screens/onboarding"
// import{org} from "./screens/org"
import { BrowserRouter , Routes , Route } from "react-router-dom"
import './App.css'

function App(){
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/signup" element={<Auth />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App;

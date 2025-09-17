import './App.css'
import { Toaster } from 'react-hot-toast';
import AppRoutes from './AppRoutes'

function App() {


  return (
    <>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#111', color: '#f5f5f5', border: '1px solid #2a2a2a' }
        }}
      />
    </>
  )
}

export default App

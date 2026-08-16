import { create } from 'zustand'
import {} from 'zustand'
import { api } from '../api/Axios'

const usestore = create((set)=>({
authstore: null,

check:async ()=>{
    const res = await api.get("/checkauth")
    console.log("checkauth",res.data)
    set({authstore:res.data

    })
    console.log(authstore)
}
}))
export default  usestore;
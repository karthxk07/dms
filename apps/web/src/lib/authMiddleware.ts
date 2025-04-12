import axios from 'axios';

const isAuth = ()=>{
    axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/getUser`,{withCredentials : true})
    .then(()=>{})
    .catch(()=>{
      window.location.href = "/auth";
    }) 
}


export {isAuth};

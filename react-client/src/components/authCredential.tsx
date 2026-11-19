import { Center } from "./center";
import GlassCard from "./glassGg";

export function AuthCredentials(){
    return(
        <div style={{
            background: "linear-gradient(135deg, #6d7cff, #a3b4ff, #d8ddff)",
            minHeight: "100vh",
            minWidth:"100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <GlassCard style={{ width: "90%", padding: "10px", borderRadius: "20px", borderStyle: "none"}}>
                <Center>
                  <div style={{fontSize:40 , padding:"20px" , color:"#dfd5ca"}}>Welcome to TaskFlow</div>
             </Center>
             <Center style={{fontSize:25}}>
                 Create your Account 
             </Center>
                 <Center>
                 <label >
                     Email:
                     <input type={"text"} placeholder="Enter your Email" style={{padding:"15px" , margin:"30px" , borderRadius:"10px" , width:"80%" , opacity:"0.8"}}/>
                 </label>
             </Center>

             <Center> 
                 <label>
                     Password:
                     <input type={"password"} placeholder="Enter a Password" style={{padding:"15px" , margin:"30px" , borderRadius:"10px" , width:"80%" , opacity:"0.8"}} />
                 </label>
             </Center>           
             <Center>
                  <button type="submit"style={{padding:"15px" , backgroundColor:"black",color:"white" ,margin:"30px" , borderRadius:"10px" , width:"50%" , opacity:"0.8"}}>Signup</button>
             </Center>
        </GlassCard>
    </div>
    )
}
import{a as i}from"./chunk-BLA6EKOB.js";import{b as p}from"./chunk-KH54WQ6O.js";import{$ as d,F as n,Y as g,d as h,ea as T,o as s,s as c,u}from"./chunk-CU6XLLBJ.js";var v=(()=>{let r=class r{constructor(e){this.http=e,this.authTokenKey="auth_token",this.idTokenKey="id_token",this.guestTokenKey="guest_token",this.tokenUrl=i.authApiUrl,this.registerUrl=i.userApiUrl+"/register",this.guestTokenUrl=i.authApiUrl+"/guest",this.idTokenUrl=i.authApiUrl+"/refresh",this.roles=[]}retrieveGuestToken(){return h(this,null,function*(){if(this.isAuthenticated())console.log("Is allready authenticated");else{console.log("Is not authenticated");let e=yield c(this.http.get(this.guestTokenUrl).pipe(n(t=>(console.error("Error obtaining guest token",t),s(null)))));e&&e.jwt?(this.storeGuestToken(e.jwt),this.roles=this.extractRolesFromToken(e.jwt),console.log("Retrieved new guest token from server, with roles: ",this.roles)):console.log("Failed to retrieve JWT")}})}getTokenByIdToken(){return h(this,null,function*(){let e=localStorage.getItem(this.idTokenKey);if(console.log("read lokal idToken: "+e),e===null){console.log("no id token exists, login first");return}else try{let t=yield c(this.http.get(this.idTokenUrl,{observe:"response"}).pipe(n(o=>(console.error("Error obtaining user token",o),s(null)))));t&&t.body?(this.storeTokens(t.body),this.roles=this.extractRolesFromToken(t.body.jwt),console.log("Retrieved new user token from server, with roles: ",this.roles)):console.log("Failed to retrieve JWT")}catch(t){console.error("Error occurred while obtaining the token:",t)}})}getToken(){let e;return this.isAuthenticated()?(e=localStorage.getItem(this.authTokenKey),console.log("got auth token")):(e=localStorage.getItem(this.guestTokenKey),console.log("got guest token")),console.log("read lokal token: "+e),e===null&&(this.retrieveGuestToken(),e=localStorage.getItem(this.guestTokenKey)),e&&(this.roles=this.extractRolesFromToken(e)),e}getIdToken(){return console.log("read lokal idToken"),localStorage.getItem(this.idTokenKey)}loginUser(e,t){return this.http.post(this.tokenUrl,{username:e,password:t},{observe:"response"}).pipe(g(o=>{this.storeTokens(o.body),this.roles=this.extractRolesFromToken(o.body.jwt),console.log("Retrieved user token from server, with roles: ",this.roles)}),u(o=>o.status),n(o=>(console.error("Error obtaining user token",o),s(o.status||500))))}registerUser(e,t){return this.http.post(this.registerUrl,{username:e,password:t},{observe:"response"}).pipe(u(o=>o.status),n(o=>(console.error("Error obtaining user token",o),s(o.status||500))))}storeTokens(e){localStorage.setItem(this.authTokenKey,e.jwt),localStorage.setItem(this.idTokenKey,e.idToken)}storeGuestToken(e){localStorage.setItem(this.guestTokenKey,e)}clearTokens(){localStorage.removeItem(this.authTokenKey),localStorage.removeItem(this.guestTokenKey)}isTokenValid(e){try{let o=JSON.parse(atob(e.split(".")[1])).exp,a=Math.floor(Date.now()/1e3);if(o<a)if((localStorage.getItem(this.idTokenKey)||"")!==""){if(this.getTokenByIdToken(),localStorage.getItem(this.authTokenKey))return!0}else return!1;return!0}catch(t){return console.error("Invalid token format",t),!1}}isAuthenticated(){let e=localStorage.getItem(this.authTokenKey)||"";return e!==""&&this.isTokenValid(e)}extractRolesFromToken(e){return this.decodeToken(e)?.role||[]}decodeToken(e){try{let o=e.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),a=decodeURIComponent(atob(o).split("").map(k=>"%"+("00"+k.charCodeAt(0).toString(16)).slice(-2)).join(""));return JSON.parse(a)}catch(t){return console.error("Invalid token format",t),null}}hasRole(e){return this.isAuthenticated(),this.roles.includes(e)}};r.\u0275fac=function(t){return new(t||r)(T(p))},r.\u0275prov=d({token:r,factory:r.\u0275fac,providedIn:"root"});let l=r;return l})();export{v as a};

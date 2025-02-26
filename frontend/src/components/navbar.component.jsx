import {useContext, useState} from "react";
import {Link, Outlet, useNavigate} from "react-router-dom";
import logo from "../imgs/logo.png";
import React from "react";
import { UserContext } from "../App.jsx";
import UserNavigationPanel from "./user-navigation.component.jsx";

const Navbar = () => {

    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

    const [userNavPanel, setUserNavPanel] = useState(false);

    const { userAuth, userAuth: {access_token, profile_img} } = useContext(UserContext);

    let Navigate = useNavigate();

    const handleUserNavPanel = () => {
        setUserNavPanel(curval=> !curval);
    }

    const handleBlur = () => {
        setTimeout(()=> {
            setUserNavPanel(false);
        }, 200);

    }

    const handleSearch = (e) => {
        let query = e.target.value;

        // press enter and something exist in searchbar
        if(e.keyCode == 13 && query.length){
            Navigate(`/search/${query}`);
        }
    }

    return (
        <>
            <nav className = "z-10 sticky top-0 flex items-center gap-12 w-full px-[5vw] py-5 h-[80px] border-b border-grey bg-white">
                <Link to ="/" className = "flex-none w-10 h-10">
                    <img src = {logo} className = "w-full"/>
                </Link>

                <div className={
                    "absolute bg-white w-full left-0 top-full mt-0.5 border-b\
                    border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 \
                    md:p-0 md:w-auto md:show " + (searchBoxVisibility ? "show" : "hide"
                    ) }>
                    <input 
                    type="text"
                    placeholder="Search"
                    className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
                    onKeyDown={handleSearch}
                    />

                    <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 
                                -translate-y-1/2 text-xl text-dark-grey" />
                </div>

                <div className="flex items-center gap-3 md:gap-6 ml-auto">
                    <button className="md:hidden bg-grey w-12 h-12 rounded-full
                                    flex items-center justify-center"
                                    onClick={()=>setSearchBoxVisibility(currentval => !currentval)}>
                        <i className="fi fi-rr-search text-xl "></i>
                    </button>

                    <Link to="/editor" className="hidden md:flex gap-2 link">
                        <i className="fi fi-rr-file-edit"></i>
                        <p>write</p>
                    </Link>

                    {
                        access_token ?
                        <>
                            <Link to="/dashboard/notification">
                                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                                    <i className ="fi fi-rr-bell text-2xl block mt-1.5"> </i>
                                </button>
                            </Link>

                            <div className="relative"
                                onClick={handleUserNavPanel}
                                onBlur={handleBlur}>
                                <button className="w-12 h-12 mt-1.5 hover:bg-black/10 rounded-full">
                                    <img src={profile_img} className=" object-cover rounded-full transition hover:brightness-90 "/>
                                </button>
                                {
                                    userNavPanel ? <UserNavigationPanel />  : ""
                                }

                            </div> 

                        </>
                        :
                        <>
                            <Link className="btn-dark py-2" to="/signin">
                                Sign in
                            </Link>

                            <Link className="btn-light py-2 hidden md:flex" to="/signup">
                                Sign up
                            </Link>
                        </>

                    }


                </div>
            </nav>

            <Outlet />
        </>


    )
}

export default Navbar;

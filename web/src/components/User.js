import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import Mask from "./Mask";
import Trade from "./Trade";
import Exchange from "./Exchange";
import Redeem from "./Redeem";
import { langText } from "../lang";
import UserContext from '../UserContext.js';
import { toast } from 'react-toastify';
import clipboardIcon from "../public/clipboard.svg";

const Clipboard = styled.img`
  margin-left: 15px;
  margin-top: 3.5px;
`;

const PositionFixed = styled.div`
  position: fixed;
  bottom: 150px;
  right: 15px;
  z-index: 5;
  @media(min-width: 1280px) {
    bottom: unset;
    top: 150px;
    right: 120px;
  }
  @media(min-width: 1920px) {
    display: none;
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: #0F2250;
  box-shadow: 0px 3px 6px #1B3A76B5;
  border-radius: 39px;
  min-width: 390px;
}
`;

const Menu = styled.div`
  position: relative;
  padding: 28px 32px 0 32px;
`;

const UserInfo = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 76px;
  background: #0F2250;
  box-shadow: 0px 3px 6px #1B3A76B5;
  border-radius: 48px;
  box-sizing: border-box;
  padding-left: 39px;
`;

const Username = styled.div`
  font-size: 26px;
  display: flex;
`;

const UserSignOut = styled.a`
  font-size: 16px;
  text-decoration: underline;
  color: #FFFFFF;
  margin-left: 10px;
`;

const Points = styled.div`
  position: relative;
  background: #3046BF;
  box-shadow: inset 0px 3px 6px #0000003C;
  border-radius: 21px;
  font-size: 22px;
  text-align: center;
  padding: 10px 20px;
  margin-bottom: 40px;
`;

const ActionBar = styled.div`
  position: relative;
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #2A64F2 0% 0% no-repeat padding-box;
  box-shadow: 0px 3px 6px #00000050;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  margin-right: 10px;
  user-select: none;
  input {
    display: block;
    width: 45px;
    height: 45px;
    position: absolute;
    top: -2px;
    left: -2px;
    opacity: 0;
    z-index: 2;
    -webkit-touch-callout: none;
  }
  span {
    display: block;
    width: 20px;
    height: 3px;
    margin-top: 3px;
    margin-bottom: 2px;
    border-radius: 20px;
    position: relative;
    background: #FFFFFF;
    z-index: 1;
    transform-origin: 4px 0px;
    transition: transform 0.5s ease,
    background 0.5s ease,
    opacity 0.55s ease;
  }
  span:first-child {
    transform-origin: 0% 0%;
  }
  span:nth-last-child(2) {
    transform-origin: 0% 100%;
  }
  input:checked ~ span {
    opacity: 1;
    transform: rotate(135deg) translate(-11px, 4px);
    background: #FFFFFF;
  }
  input:checked ~ span:nth-last-child(3) {
    opacity: 0;
    transform: rotate(0deg) scale(0.2, 0.2);
  }
  input:checked ~ span:nth-last-child(2) {
    transform: rotate(45deg) translate(0px, -12px);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ActionButton = styled.div`
  width: 146px;
  height: 48px;
  box-sizing: border-box;
  background: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0px 3px 6px #00000080;
  text-align: center;
  font-size: 20px;
  font-weight: bolder;
  color: #000000;
  padding: 10px 17px;
  cursor: pointer;
`;

const UserWide = styled.div`
  display: none;
  @media(min-width: 1920px) {
    position: fixed;
    left: 65%;
    display: block;
    min-width: 380px;
    padding: 28px 32px 0 32px;
    background: #0F2250 0% 0% no-repeat padding-box;
    box-shadow: 0px 3px 6px #1B3A76B5;
    border-radius: 39px;
  }
  ${Username} {
    margin-bottom: 10px;
  }
  ${UserSignOut} {
    margin: 0;
  }
  ${Points} {
    margin-top: 30px;
    margin-bottom: 20px;
  }
  ${ActionButton} {
    width: 48%;
  }
`;

const SubMenuMask = styled(Mask)`
  z-index: 5;
`;

const UserContainer = () => {
  const [token, setToken] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTradingOpen, setIsTradingOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [user, setUser] = useContext(UserContext);
  const nickname = user.nickname;
  const isVendor = user.role === 'vendor';
  const points = user.points;

  const openMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleMask = () => {
    document.getElementById("menuCheck").checked = false;
    setIsMenuOpen(false);
  }
  const handleSubMenuMaskClose = () => {
    setIsTradingOpen(false);
    setIsExchangeOpen(false);
    setIsRedeemOpen(false);
  }

  const copyHandler = (uid) => {
    navigator.clipboard.writeText(uid);
    toast(`The uid is copied! (Malware Playground only)`);
  }
  
  useEffect(() => {
    const tokenFromCookies = Cookies.get('token');
    if (tokenFromCookies === undefined) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const tokenFromParams = urlParams.get('token');
      if (tokenFromParams !== undefined) setToken(tokenFromParams)
      return;
    } else {
      setToken(tokenFromCookies);
    }
  })

  return (
    <>
      <PositionFixed>
        <Container>
          {
            isMenuOpen ?
              <Menu>
                <Mask onClick={handleMask} />
                <Points>
                  {langText("USER_CURRENT_POINTS")}{points} P
                </Points>
                <Actions>
                  {isVendor
                    ? null
                    : <ActionButton onClick={() => setIsTradingOpen(true)}>{langText("USER_TRADE_POINTS")}</ActionButton>
                  }
                  {isVendor
                    ? <ActionButton onClick={() => setIsRedeemOpen(true)}>{langText("REDEEM_LIST_TITLE")}</ActionButton>
                    : <ActionButton onClick={() => setIsExchangeOpen(true)}>{langText("USER_REDEEM_POINTS")}</ActionButton>
                  }
                </Actions>
              </Menu> :
              null
          }
          <UserInfo>
            <Username>
              {nickname}
              {nickname
                ? <Clipboard onClick={() => copyHandler(user.uid)} src={clipboardIcon} />
                : null
              }
            </Username>
            <ActionBar onClick={openMenu}>
              <input type="checkbox" id="menuCheck" />
              <span />
              <span />
              <span />
            </ActionBar>
          </UserInfo>
        </Container>
      </PositionFixed>
      <UserWide>
        <Username>{nickname}</Username>
        <Points>
          {langText("USER_CURRENT_POINTS")}{points} P
        </Points>
        <Actions>
          {isVendor
            ? null
            : <ActionButton onClick={() => setIsTradingOpen(true)}>{langText("USER_TRADE_POINTS")}</ActionButton>
          }
          {isVendor
            ? <ActionButton onClick={() => setIsRedeemOpen(true)}>{langText("REDEEM_LIST_TITLE")}</ActionButton>
            : <ActionButton onClick={() => setIsExchangeOpen(true)}>{langText("USER_REDEEM_POINTS")}</ActionButton>
          }
        </Actions>
      </UserWide>
      {(isTradingOpen || isExchangeOpen || isRedeemOpen) && <SubMenuMask onClick={handleSubMenuMaskClose} />}
      {isTradingOpen && <Trade setIsTradingOpen={setIsTradingOpen} />}
      {isExchangeOpen && <Exchange setIsExchangeOpen={setIsExchangeOpen} />}
      {isRedeemOpen && <Redeem setIsRedeemOpen={setIsRedeemOpen} />}
    </>
  )
}

UserContainer.defaultProps = {
  nickname: "未知人物",
  points: "9999",
}

export default UserContainer;

import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import Modal from "../Modal";
import { langText } from "../../lang";
import ReactHtmlParser from "react-html-parser"
import UserContext from '../../UserContext.js';
import { toast } from 'react-toastify';
import clipboardIcon from "../../public/clipboard.svg";

const Clipboard = styled.img``;

const Container = styled(Modal)`
  @media(min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const Title = styled.div`
  font-size: 36px;
  font-weight: bold;
  text-align: center;

  @media(min-width: 768px) {
    padding-left: 30px;
  }
`;

const Description = styled.h3`
  @media(min-width: 768px) {
    padding-left: 30px;
  }
`;

const Button = styled.button`
  position: relative;
  background: #E5E5E5;
  border-radius: 13px;
  width: 100%;
  height: 57px;
  border: none;
  box-shadow: none;
  margin-bottom: 34px;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    padding-right: 20px;
  }

  :active {
    background: #858383;
  }

  @media(min-width: 768px) {
    background: none;
    border-radius: 0;
    min-width: 249px;
    justify-content: left;
    padding-left: 30px;

    :active {
      background: rgba(0, 38, 128, 0.15);
    }
  }
`

const Cancel = styled(Button)`
  background: none;
  color: #8D8D8D;
  padding-left: 10px;
  font-size: 24px;
`;

const Content = styled.div`
  @media(min-width: 768px) {
    display: block;
    height: 100%;
    padding-left: 3em;
    border-left: 2px solid #000;

    ${Title} {
      font-size: 28px;
    }

    ${Description} {
      font-size: 20px;
    }
  }
`;

const TableWrapper = styled.div`
  max-height: 60vh;
  overflow: auto;

  @media(min-width: 768px) {
    max-height: 35vh;
  }
`;

const CenterTd = styled.td`
  display: flex;
  align-items: center;
`;

const Table = styled.table``;

const copyHandler = (code) => {
  navigator.clipboard.writeText(code);
  toast(`The code ${code} is copied!`);
}

const CouponRow = ({code, changedAt, couponsType}) => {
  const [,value] = couponsType.name.split("_");
  const time = new Date(changedAt);
  return(
    <tr>
      <td>{value}</td>
      <td>{`${time.getFullYear()}/${time.getMonth()+1}/${time.getDate()}`}</td>
      <CenterTd>{code} | <Clipboard onClick={() => copyHandler(code)} src={clipboardIcon} /></CenterTd>
    </tr>
  )
}

const CouponPage = ({ setPage }) => {
  const [coupons, setCoupons] = useState([]);
  useEffect(()=>{
    const apiURL = `${process.env.POINT_URL}/coupons`;
    const headers = { 'Authorization': `Bearer ${Cookies.get('token')}` }
    axios.get(apiURL, { headers })
      .then((resp) => {
        const { success, data } = resp.data;
        setCoupons(data);
      })
      .catch((error) => {
        const { state, data: {message} } = error.response;
        console.error('get coupons error: ', message);
    });
  },[]);

  const handleCancel = () => setPage(PointExchange.BriefInfo);
  return (
    <Content>
      <Title>{langText("COUPON_YOUR_COUPON")}</Title>
      <Description>{langText("COUPON_DEADLINE_NOTICE")}</Description>
      <TableWrapper>
        <thead>
          <tr>
            <th>{langText("COUPON_PRICE")}</th>
            <th>{langText("COUPON_CHANGED_DATE")}</th>
            <th>{langText("COUPON_TOKEN")}</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c, idx) => <CouponRow key={idx} changedAt={c.updated_at} code={c.code} couponsType={c.coupons_type} />) }
        </tbody>
      </TableWrapper>
      <Button><a target="_blank" rel="noopener noreferrer" href="https://shopee.tw/hitcon">{langText("COUPON_HITCON_STORE")}</a></Button>
      <Cancel onClick={handleCancel}>{langText("BACK")}</Cancel>
    </Content>
  )
}

const List = styled.div`
  height: 440px;
  width: 100%;
  background-color: #EBEBEB;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  > div {
    margin: 1em 0;
  }
  box-shadow: inset 0 0 5px #000000;
  ::-webkit-scrollbar {
    back
  }
`;

const Wrapper = styled.div`
  display: flex;
  background-color: #072680;
  box-sizing: border-box;
  color: #fff;
  width: 309px;
  height: 88px;
  border-radius: 11px;
  box-shadow: 0px 3px 6px #00000096;
`;
const Info = styled.div`
  flex-grow: 3;
  padding: 15px 0 15px 20px;
  font-size: 22px;
`;

const Value = styled.div``;
const Cost = styled.div`
  font-size: 16px;
  color: #DDDDDD;
`;

const Action = styled.div`
  flex-grow: 1;
  padding: 15px 15px;
  padding-top: 25px;
  border-left: 1px solid #fff;
  font-size: 20px;
  text-align: center;
  cursor: pointer;
`;

const Coupon = ({ name, points, setTargetCoupon }) => {
  const setCoupon = () => {
    setTargetCoupon({ name, points });
  }
  const value = name.split('_')[1];
  return (
    <Wrapper>
      <Info>
        <Value>{value}{langText("COUPON_NAME")}</Value>
        <Cost>{langText("COUPON_COST")} {points}P</Cost>
      </Info>
      <Action onClick={setCoupon}>{langText("COUPON_EXCHANGE")}</Action>
    </Wrapper>
  )
}

const ExchangeSteps = Object.freeze({
  'CouponList': 0,
  'ConfirmExchange': 1,
  'Success': 2,
});

const ExchangePage = ({ setPage }) => {
  const [token, setToken] = useState();
  const [user, setUser] = useContext(UserContext);
  const [step, setStep] = useState(ExchangeSteps.CouponList);
  const handleBack = () => setStep(ExchangeSteps.CouponList);
  const handleCancel = () => setPage(PointExchange.BriefInfo);
  const [targetCoupon, setTargetCoupon] = useState(null);
  const [couponList, setCouponList] = useState([]);
  const handleExchange = (remainingPoints) => {
    const apiURL = `${process.env.POINT_URL}/coupons`;
    const headers = { 'Authorization': `Bearer ${Cookies.get('token')}` }
    axios.post(apiURL,{ type: targetCoupon.name }, { headers })
      .then((resp) => {
        const { success, data } = resp.data;
        user.points = remainingPoints;
        setUser(user);
      }).catch((error) => {
        const { state, data: {message} } = error.response;
        console.error('exchange Coupons error: ', message);
        toast(message);
    });
    setStep(ExchangeSteps.Success);
  };

  useEffect(() => {
    const apiURL = `${process.env.POINT_URL}/coupons/types`;
    const headers = { 'Authorization': `Bearer ${Cookies.get('token')}` }
    axios.get(apiURL, { headers })
      .then((resp) => {
        const { success, data } = resp.data;
        setCouponList(data);
      })
      .catch((error) => {
        const { state, data: {message} } = error.response;
        console.error('get coupons/types error: ', message);
    });
  },[]);

  useEffect(() => {
    if (targetCoupon === null) return;
    if (user.points - targetCoupon.points < 0) {
      toast(`The balance is not enough!`);
      return;
    }
    setStep(ExchangeSteps.ConfirmExchange);
  }, [targetCoupon])
  return (
    <>
      {step === ExchangeSteps.CouponList ?
        <Content>
          <Title>{langText("COUPON_EXCH_ITEM")}</Title>
          <List>
            {couponList.map((c, index) => <Coupon name={c.name} points={c.points} key={index}  setTargetCoupon={setTargetCoupon} />)}
          </List>
          <Cancel onClick={handleCancel}>{langText("BACK")}</Cancel>
        </Content> : null}
      {step === ExchangeSteps.ConfirmExchange ?
        <Content>
          <Title>{langText("COUPON_CONFIRM_EXCH")}</Title>
          {ReactHtmlParser(langText("COUPON_USING_POINTS")
            .replace("{cost}", targetCoupon.points)
            .replace("{value}", targetCoupon.name.split('_')[1])
            .replace("{points}", (user.points - targetCoupon.points)))}
          <Cancel onClick={handleBack}>{langText("CANCEL")}</Cancel>
          <Button onClick={() => handleExchange((user.points - targetCoupon.points))}>{langText("CONFIRM")}</Button>
        </Content> : null}
      {step === ExchangeSteps.Success ?
        <Content>
          <Title>{langText("COUPON_EXCH_DONE")}</Title>
          <div>{langText("COUPON_DONE_NOTICE")}</div>
          <Button onClick={handleBack}>{langText("DONE")}</Button>
        </Content> : null}
    </>
  )
}

const PointExchange = Object.freeze({
  'BriefInfo': 0,
  'OwnCoupon': 1,
  'ExchangeCoupon': 2,
});

const Exchange = ({ setIsExchangeOpen }) => {
  const [token, setToken] = useState();
  const [user, setUser] = useContext(UserContext);
  const [page, setPage] = useState(PointExchange.BriefInfo);
  const switchCoupon = () => setPage(PointExchange.OwnCoupon);
  const switchExchange = () => setPage(PointExchange.ExchangeCoupon);
  const handleCancel = () => setIsExchangeOpen(false);

  useEffect(() => {
    const tokenFromCookies = Cookies.get('token');
    if (tokenFromCookies === undefined) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const tokenFromParams = urlParams.get('token');
      if (tokenFromParams !== undefined) setToken(tokenFromParams)
    } else {
      setToken(tokenFromCookies);
    }
  })

  useEffect(() => {
    if (token === undefined) return;
    const apiURL = `${process.env.POINT_URL}/users/me`;
    const headers = { 'Authorization': `Bearer ${Cookies.get('token')}` }
    axios.get(apiURL, { headers })
      .then((resp) => {
        const { data } = resp.data;
        user.points = data.points;
        setUser(user);
      })
      .catch((error) => {
        const { state, data: {message} } = error.response;
        console.error('get users error: ', message);
      });
  },[token])

  return (
    <Container>
      {page === PointExchange.BriefInfo ?
        <>
          <Title>{langText("COUPON_POINTS_EXCH")}</Title>
          <Description>
            {langText("POINTS_OWNED").replace("{points}", user.points)}
          </Description>
          <Button onClick={switchCoupon}>
            {langText("COUPON_YOUR_COUPON")}
          </Button>
          <Button onClick={switchExchange}>
            {langText("COUPON_EXCH_ITEM")}
          </Button>
          <Cancel onClick={handleCancel}>{langText("BACK")}</Cancel>
        </> : null}
      {page === PointExchange.OwnCoupon ? <CouponPage setPage={setPage} /> : null}
      {page === PointExchange.ExchangeCoupon ? <ExchangePage setPage={setPage} /> : null}
    </Container>
  )
}

export default Exchange;

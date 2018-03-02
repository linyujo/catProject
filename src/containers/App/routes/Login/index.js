import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import FadeErrMsg from '../../../../components/FadeErrMsg';
import * as memberAPI from '../../../../fetch/memberAPI';
import * as accessLocalStorage from '../../../../fetch/accessLocalStorage';
import { fetchMember } from '../../../../redux/member';
import BounceInUp from '../../../../components/BounceInUp';
import LoadingSpinner from '../../../../components/LoadingSpinner';

import './login.css';

const mapStateToProps = state => ({ member: state.member });
const mapDispatchToProps = dispatch => (bindActionCreators({
    fetchMember: fetchMember
},dispatch));

class Login extends Component {
    constructor() {
		super();
		this.state = {
			isRegularLogin: false,
			emailCheck: false,
			passwordCheck: false,
			email: '',
			password: '',
			errorMsg: '',
			isLoading: false,
		};
    }
    checkEmail(evt) {
		const validateEmail = (email) => {
			const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return regex.test(email);
		};
		if (evt.target.value === '' || validateEmail(evt.target.value) === false) {
			this.setState({
				emailCheck: false,
				errorMsg: '請輸入正確的信箱格式',
			});
			return;
		}
		this.setState({
			emailCheck: true,
			errorMsg: '',
			email: evt.target.value,
		});
    }
    checkPassword(evt) {
		if (evt.target.value === '' || evt.target.value.length < 8) {
			this.setState({
				passwordCheck: false,
				errorMsg: '請輸入密碼',
			});
			return;
		}
		this.setState({
			passwordCheck: true,
			errorMsg: '',
			password: evt.target.value,
		});
    }
    requestLogin() {
        if (this.state.emailCheck === false
			|| this.state.emailCheck === false) {
			this.setState({ errorMsg: 'Oops,有資料未填寫完整喔' });
			return;
		}
		this.setState({isLoading: true});
        memberAPI.login(this.state.email, this.state.password)
                 .then((res) => {
					this.setState({isLoading: false});
                    if (res.status === 200) {
                        accessLocalStorage.setItems(res.data);
						this.props.fetchMember();
						this.props.history.push('/home');                  
                    }
                 })
                 .catch((err) => {
					console.log('Login requestLogin, err:',err);
					this.setState({isLoading: false});
				 });  
	}
	requestLoginWithFB() {
		this.setState({isLoading: true});
		const FB = window.FB;
		const requestLogin = (authResponse) => {
			memberAPI.loginWithFacebook(authResponse)
			         .then((res) => {
						this.setState({isLoading: false});
						if (res.status === 200) {// 註冊成功
							accessLocalStorage.setItems(res.data);
							this.props.fetchMember();
							this.props.history.push('/home');
						}
					 })
					 .catch((err) => {
						console.log('Login, requestLoginWithFB, error:', err);
						this.setState({isLoading: false});
					 });
		}
		FB.getLoginStatus((res) => {
			if (res.status === 'connected') { // 使用者已登入FB && 已授權資料給你的網站
				requestLogin(res.authResponse);
			} else { //使用者已登入FB, 但尚未授權資料給你的網站 || 使用者還沒登入FB
				FB.login((res) => {
					if (res.authResponse) {
						requestLogin(res.authResponse);
					}
				});
			}
		});
	}
    render() {
        return (
            <div className="u-wrapper-fixed-w100-h100">
                <Helmet>
					<title>login</title>
				</Helmet>
                <div className="u-wrapper-absolute-center">
                    <div className="form_header">
						<h3>Cat Crush</h3>
					</div>
					{
						this.state.isRegularLogin === false ? // 選擇一般登入嗎 
						<div>
							<div className="btn-group btn-group-center btn-login">
								<input type="button" value="登入" className="btn btn-lg btn-secondary" onClick={() => this.setState({isRegularLogin: true})} />
							</div>
							<div className="btn-group btn-group-center btn-register">
								<input type="button" value="以Facebook帳號繼續" className="btn btn-lg btn-fb font-white" onClick={() => this.requestLoginWithFB()} />
							</div>
						</div>
						:
						''
					}
					<BounceInUp inCondition={this.state.isRegularLogin}>
						<form className="form form_login">
							<div className="form-field-email icon-mail">
								<input type="email" placeholder="信箱" onBlur={evt => this.checkEmail(evt)} />
							</div>
							<div className="form-field-password icon-key">
								<input type="password" placeholder="密碼" onBlur={evt => this.checkPassword(evt)} />
							</div>
							<FadeErrMsg 
								inCondition={this.state.errorMsg !== '' ? true : false}
								errorMsg={this.state.errorMsg} 
							/>
							<div className="btn-group btn-group-center btn-login">
								<input type="button" value="登入" className="btn btn-lg btn-secondary" onClick={() => this.requestLogin()} />
							</div>
						</form>
					</BounceInUp>
                </div>
				<LoadingSpinner isLoading={this.state.isLoading} />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
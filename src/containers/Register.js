import React from 'react';
import {Authentication} from 'components';
import { connect } from 'react-redux';
import { registerRequest } from 'actions/authentification';

import { browserHistory} from 'react-router';


class Register extends React.Component{
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
    }

    handleRegister(id, pw){
        return this.props.registerRequest(id, pw).then(
            () => {
                if(this.props.status === 'SUCCESS'){
                    Materialize.toast("SUCCESS! Please log in.", 2000);
                    browserHistory.push('/login');
                    return true;
                }else{
                    let errorMessage = [
                        'Invaild Username',
                        'Password is too short',
                        'Username already exists'
                    ];

                    let $toastContent = $('<span style="color:#FFB4BA">' + errorMessage[this.props.errorCode - 1] + '</span>');
                    Materialize.toast($toastContent, 2000);
                    return false;
                }
            }
        );
    }

    render(){
        return(
            <div>
                <Authentication mode={false}
                    onRegister={this.handleRegister} />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        status : state.authentification.register.state,
        errorCode : state.authentification.register.error
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        registerRequest : (id, pw) => {
            return dispatch(registerRequest(id, pw));
        }
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Register);

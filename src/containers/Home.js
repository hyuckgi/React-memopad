import React from 'react';
import { connect } from 'react-redux';
import { Write, MemoList } from 'components';
import { memoPostRequest, memoListRequest } from 'actions/memo';

class Home extends React.Component{

    constructor(props) {
        super(props);
        this.handlePost = this.handlePost.bind(this);
        this.loadNewMemo = this.loadNewMemo.bind(this);
        this.loadOldMemo = this.loadOldMemo.bind(this);

        this.state = {
            loadingState : false
        };
    }

    componentDidMount() {

        const loadMemoLoop = () => {
            this.loadNewMemo().then(
                () => {
                    this.memoLoaderTimeoutId = setTimeout(loadMemoLoop, 5000);
                }
            );
        };

        this.props.memoListRequest(true).then(
            () => {
                loadMemoLoop();
            }
        );

        $(window).scroll( () => {
            if($(document).height() - $(window).height() - $(window).scrollTop() < 250 ) {
                if(!this.state.loadingState){
                    loadOldMemo();
                    this.setState({
                        loadingState : true
                    });
                }
            }else{
                if(this.state.loadingState){
                    this.setState({
                        loadingState : false
                    });
                }
            }
        });

        const loadUntilScrollable = () => {
            if($("body").height() < $(window).height() ){
                this.loadOldMemo().then(
                    () => {
                        if(!this.props.isLast) {
                            loadUntilScrollable();
                        }
                    }
                );
            }
        };

        this.props.memoListRequest(true).then(
            () => {
                loadUntilScrollable();
                loadMemoLoop();
            }
        );
    }

    componentWillUnmount() {
        clearTimeout(this.memoLoaderTimeoutId);
        $(window).unbind();
    }

    loadNewMemo(){
        if(this.props.listStatus === 'WAITING')
            return new Promise((resolve, reject) => {
                resolve();
            });
        if(this.props.memoData.length === 0 )
            return this.props.memoListRequest(true);

        return this.props.memoListRequest(false, 'new', this.props.memoData[0]._id);
    }

    loadOldMemo(){
        if(this.props.isLast){
            return new Promise(
                (resolve, reject) => {
                    resolve();
                }
            );
        }

        let lastId = this.props.memoData[this.props.memoData.length - 1]._id;

        return this.props.memoListRequest(false, "old", lastId).then( () => {
            if(this.props.isLast){
                Materialize.toast('You are reading the last page', 2000);
            }
        });
    }



    handlePost(contents){
        return this.props.memoPostRequest(contents).then(
            () => {

                console.log(this.props.postStatus);
                if(this.props.postStatus.status === "SUCCESS"){

                    this.loadNewMemo().then(
                        () => {
                            Materialize.toast("Success!", 2000);
                        }
                    );
                }
                else{
                    let $toastContent;
                    switch(this.props.postStatus.error){
                        case 1:
                            $toastContent = $('<span style="color:#FFB#BA">You are not logged in</span>');
                            Materialize.toast($toastContent, 2000);
                            setTimeout(() => {location.reload(false);}, 2000);
                            break;
                        case 2:
                            $toastContent = $('<span style="color:#FFB#BA">Please write something</span>');
                            Materialize.toast($toastContent, 2000);
                            break;
                        default :
                            $toastContent = $('<span style="color:#FFB#BA">Something Broke</span>');
                            Materialize.toast($toastContent, 2000);
                            break;
                    }
                }
            }
        );
    }
    render(){
        const write = (
            <Write onPost={this.handlePost}/>
        );


        return(
            <div className="wrapper">
                { this.props.isLoggedIn ? write : undefined }
                <MemoList data={this.props.memoData} currentUser={this.props.currentUser}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentification.status.isLoggedIn,
        postStatus : state.memo.post,
        currentUser : state.authentification.status.currentUser,
        memoData : state.memo.list.data,
        listStatus : state.memo.list.status,
        isLast : state.memo.list.isLast
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        memoPostRequest : (contents) => {
            return dispatch(memoPostRequest(contents));
        },
        memoListRequest : (isInitial, listType, id, username) => {
            return dispatch(memoListRequest(isInitial, listType, id, username));
        }
    };
};

Home.PropTypes = {
    username: React.PropTypes.string
};

Home.defaultProps = {
    username: undefined
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);

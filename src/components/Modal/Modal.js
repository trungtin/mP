import {Modal, Button} from 'react-bootstrap';
import React, {Component, PropTypes} from 'react';

export default class ModalButton extends Component {
  static propTypes = {
    modalData: PropTypes.object.isRequired
  }
  state = {
    showModal: false
  }
  close() {
    this.setState({showModal: false});
  }
  open() {
    this.setState({showModal: true});
  }
  render() {
    const {showModal} = this.state;
    const {buttonText, modalTitle, modalBody, modalFooter, modalCloseButton} = this.props.modalData;
    return (
      <div>
        <Button bsStyle="primary" bsSize="large" onClick={::this.open}>
          {buttonText}
        </Button>
        <Modal show={this.state.showModal} onHide={::this.close}>
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalBody}
          </Modal.Body>
          <Modal.Footer>
            <div onClick={::this.close}>{modalCloseButton}</div>
            {modalFooter}
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

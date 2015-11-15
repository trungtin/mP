import {Modal, Col} from 'react-bootstrap';
import React, {Component, PropTypes} from 'react';

export default class MyModal extends Component {
  static propTypes = {
    modalData: PropTypes.object.isRequired,
    children: PropTypes.array,
    beforeClose: PropTypes.func,
    bsSize: PropTypes.string,
    dialogClassName: PropTypes.string
  }
  state = {
    showModal: false
  }
  close() {
    if (this.props.beforeClose && typeof this.props.beforeClose === 'function') {
      this.props.beforeClose();
    }
    this.setState({showModal: false});
  }
  open() {
    this.setState({showModal: true});
  }
  render() {
    const {modalTitle, modalBody, modalFooter, modalCloseButton} = this.props.modalData;
    const {bsSize, dialogClassName} = this.props;
    return (
      <div>
        <Modal show={this.state.showModal} onHide={::this.close} bsSize={bsSize} dialogClassName={dialogClassName}>
          <Modal.Header closeButton>
            {modalTitle && <Modal.Title>{modalTitle}</Modal.Title>}
          </Modal.Header>
          <Modal.Body>
            {modalBody}
          </Modal.Body>
          <Modal.Footer>
            {modalCloseButton && <Col md={2} mdOffset={6} onClick={::this.close}>{modalCloseButton}</Col>}
            {modalFooter && <Col md={4}>{modalFooter}</Col>}
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

import 'isomorphic-fetch';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setGitHubRepository } from '../../actions/repository-input';
import { createWebhook } from '../../actions/webhook';
import Button from '../button';
import Step from '../step';
import { Anchor } from '../button';
import { Form, InputField, Message } from '../forms';

class RepositoryInput extends Component {
  getErrorMessage() {
    const input = this.props.repositoryInput;
    let message;

    if (input.inputValue.length > 2 && !input.repository) {
      message = 'Please enter a valid GitHub repository name or URL.';
    } else if (input.error) {
      if (input.repository) {
        message = `Repository ${input.repository} doesn't exist, is not public or doesn't contain snapcraft.yaml file.`;
      } else {
        message = input.error.message;
      }
    }

    return message;
  }

  render() {
    return (
      <div>
        <h2>Welcome</h2>
        <p>To get started building snaps, sign in with GitHub and tell us about your repository.</p>
        <ol>
          { this.step1.call(this) }
          { this.step2.call(this) }
        </ol>
      </div>
    );
  }

  step1() {
    const { authenticated } = this.props.auth;

    return (
      <Step number="1" complete={ authenticated }>
        <Anchor href="/auth/authenticate">Log in with GitHub</Anchor>
      </Step>
    );
  }

  step2() {
    const { authenticated } = this.props.auth;
    const input = this.props.repositoryInput;
    const isTouched = input.inputValue.length > 2;
    const isValid = !!input.repository && !input.error;

    return (
      <Step number="2" complete={ input.success }>
        <Form onSubmit={this.onSubmit.bind(this)}>
          <InputField
            label='Repository URL'
            placeholder='username/snap-example'
            value={input.inputValue}
            touched={isTouched}
            valid={isValid}
            onChange={this.onChange.bind(this)}
            errorMsg={this.getErrorMessage()}
          />
          { input.success &&
            <Message status='info'>
              Repository <a href={input.repositoryUrl}>{input.repository}</a> contains snapcraft project and can be built.
            </Message>
          }
          <Button type='submit' disabled={!isValid || input.isFetching || !authenticated }>
            { input.isFetching ? 'Creating...' : 'Create' }
          </Button>
        </Form>
      </Step>
    );
  }

  onChange(event) {
    this.props.dispatch(setGitHubRepository(event.target.value));
  }

  onSubmit(event) {
    event.preventDefault();
    const { repository } = this.props.repositoryInput;

    if (repository) {
      this.props.dispatch(createWebhook(repository));
    }
  }
}

RepositoryInput.propTypes = {
  repositoryInput: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  webhook: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  const {
    repositoryInput,
    auth,
    webhook
  } = state;

  return {
    auth,
    repositoryInput,
    webhook
  };
}

export default connect(mapStateToProps)(RepositoryInput);

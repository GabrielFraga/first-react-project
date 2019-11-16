/* eslint-disable react/state-in-constructor */
/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  Filter,
  PageSelector,
  ButtonContainer,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    repoState: 'open',
    repoStates: ['open', 'all', 'closed'],
    page: 1,
    loading: true,
  };

  async componentDidMount() {
    const { page, repoState } = this.state;
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: repoState,
          per_page: 5,
          page,
        },
      }),
    ]);
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  changeRepoState = async e => {
    await this.setState({ repoState: e.target.value });
    this.componentDidMount();
  };

  changePage = async e => {
    if (e.target.value === 'back') {
      await this.setState({ page: this.state.page - 1 });
      console.log(this.state.page);
    } else {
      await this.setState({ page: this.state.page + 1 });
      console.log(this.state.page);
    }
    this.componentDidMount();
  };

  render() {
    const { repository, issues, loading, repoStates, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          <h3>Filter the state of repositories</h3>
          <ul>
            {repoStates.map(state => (
              <button
                key={String.state}
                type="submit"
                onClick={this.changeRepoState}
                value={state}
              >
                {state}
              </button>
            ))}
          </ul>
        </Filter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <ButtonContainer>
          <PageSelector
            value="back"
            page={page === 1}
            onClick={this.changePage}
          >
            Back
          </PageSelector>
          <PageSelector value="next" onClick={this.changePage}>
            Next
          </PageSelector>
        </ButtonContainer>
      </Container>
    );
  }
}

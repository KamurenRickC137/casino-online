import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { 
  Grid,
  Button,
  Icon,
  Loader,
  Input,
  Checkbox,
  Dimmer
} from 'semantic-ui-react';
import Logo from '../components/Logo';
import PlayerInfo from '../components/PlayerInfo';
import Game from '../components/Game';

import './GamesList.scss'

import {
  getAllGames,
  getAllCategories,
  logoutUser
} from './utils';

/*Filter Util functions*/
const hasCommonElements = (arr1 = [], arr2 = []) => {
    return arr2.filter(item => arr1.includes(item)).length > 0
}

const filterByCategories = (games = [], selectedCategories= []) => {
  if(selectedCategories.length <=0){
    return games;
  }
  return games.filter(game => hasCommonElements(game.categoryIds, selectedCategories));
}

const filterBySearch = (games = [], searchQuery = '') => {
  if(searchQuery.trim().length <=0){
    return games;
  }
  return games.filter(game => game.name.indexOf(searchQuery) === 0);
}

class GamesList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      games: props.games,
      categories: props.categories,
      isLoading: {
        games: false,
        categories: false,
        search: false,
        logout: false,
      },
      searchQuery: '',
      selectedCategories: []
    };
  }
  getGames = async () => {
    const { dispatch } = this.props;
    const { isLoading } = this.state;
    const games = await dispatch(getAllGames());
    this.setState({
      games,
      isLoading: {
        ...isLoading,
        games: false
      }
    });
  }

  getCategories = async () => {
    const { dispatch } = this.props;
    const { isLoading } = this.state;
    const categories = await dispatch(getAllCategories());
    this.setState({
      categories,
      isLoading: {
        ...isLoading,
        categories: false
      }
    });
  }

  handleLogout = () => {
    const { player, dispatch } = this.props;
    dispatch(logoutUser(player.username));
  }

  componentDidMount() {
    const { games, categories, isLoading } = this.state;
    const newIsLoading = {...isLoading};
    if(!games.length) {
      this.getGames();
      newIsLoading.games = true;
    }
    if(!categories.length) {
      this.getCategories();
      newIsLoading.categories = true;
    }
    if((newIsLoading.games !== isLoading.games) || (newIsLoading.categories !== isLoading.categories)){
      this.setState({
        isLoading: newIsLoading
      });
    }
  }
  render() {
    const { player } = this.props;
    const { games, categories, isLoading, searchQuery, selectedCategories } = this.state;
    let filteredGames = filterByCategories(games, selectedCategories);
    filteredGames = filterBySearch(filteredGames, searchQuery);
    return (
      <div className="page-container">
        <Grid centered>
          <Grid.Row>
            <Grid.Column width={12}>
              <Grid centered>
                <Grid.Row>
                  <Grid.Column width={8}>
                    <Logo/>
                  </Grid.Column> 
                </Grid.Row>
              </Grid>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={12}>
              <Grid className="content">
                <Grid.Row>
                  <Grid.Column className="user" width={12}>
                    <PlayerInfo {...player} />
                    <Button
                      className="logout"
                      secondary
                      onClick={(e) => {
                        this.handleLogout();
                      }}
                    >
                      <Icon name="angle left" />
                      Logout
                    </Button>
                  </Grid.Column>
                  <Grid.Column width={4}>
                    <Input
                      placeholder="Search Games"
                      loading={isLoading.search}
                      icon="search"
                      onChange={(e, { value }) => {
                        this.setState({
                          searchQuery: value
                        });
                      }}
                     />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={12}>
                      <h2 className="title">Games </h2>
                      <Loader active={isLoading.games} inline/>
                      <ul className="games-list">
                        {
                          filteredGames.map(game => 
                            <Game 
                              key={game.code} 
                              {...game} 
                            />
                          )
                        }
                      </ul>
                      {
                        !isLoading.games && filteredGames.length === 0 &&
                          <h5> Oops, No Games Found! </h5>
                      }
                  </Grid.Column>
                  <Grid.Column width={4}>
                      <h2 className="title">Categories </h2>
                      <Loader active={isLoading.categories} inline/>
                      <ul className="categories">
                        {
                          categories.map(category =>
                            <li key={category.id}>
                              <Checkbox
                                value={category.id}
                                label={category.name}
                                onChange={(e, { checked }) => {
                                  const newSelectedCategories = [...selectedCategories];
                                  if(checked){
                                    newSelectedCategories.push(category.id);
                                  }else{
                                    const idx = newSelectedCategories.indexOf(category.id);
                                    newSelectedCategories.splice(idx,1);
                                  }
                                  this.setState({
                                    selectedCategories: newSelectedCategories
                                  });
                                }}
                              />
                            </li>
                          )
                        }
                      </ul>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return{
      player: state.player,
      games: state.games,
      categories: state.categories
  }
};

export default withRouter(connect(mapStateToProps)(GamesList))
import service from '../../api/fakeService'

// initial state
// shape: [{ id, quantity }]
const state = {
  added: [],
  checkoutStatus: null
}

// getters
const getters = {
  checkoutStatus: state => state.checkoutStatus,

  cartDishes: (state, getters, rootState) => {
    return state.added.map(({ id, quantity }) => {
      const dish = rootState.allDishes.all.find(dish => dish.id === id)
      return {
        id,
        name: dish.name,
        description: dish.description,
        dish_img: dish.dish_img,
        price: dish.price,
        quantity
      }
    })
  },

  cartTotalPrice: (state, getters) => {
    return getters.cartDishes.reduce((total, dish) => {
      return total + dish.price * dish.quantity
    }, 0)
  }
}

// actions
const actions = {
  checkout ({ commit, state }, dishes) {
    const savedCartItems = [...state.added]
    commit('setCheckoutStatus', null)
    // empty cart
    commit('setCartItems', { items: [] })
    service.buyDishes(
      dishes,
      () => commit('setCheckoutStatus', 'successful'),
      () => {
        commit('setCheckoutStatus', 'failed')
        // rollback to the cart saved before sending the request
        commit('setCartItems', { items: savedCartItems })
      }
    )
  },

  addDishToCart ({ state, commit }, dish) {
    commit('setCheckoutStatus', null)
    const cartItem = state.added.find(item => item.id === dish.id)
    if (!cartItem) {
      commit('pushDishToCart', { id: dish.id })
    } else {
      commit('incrementItemQuantity', cartItem)
    }
  },

  minusDishFromCart ({ state, commit }, dish) {
    commit('setCheckoutStatus', null)
    const cartItem = state.added.find(item => item.id === dish.id)
    if (!cartItem || cartItem.quantity === 1) {
      commit('deleteDishFromCart', { id: dish.id })
    } else {
      commit('decrementItemQuantity', cartItem)
    }
  }
}

// mutations
const mutations = {
  pushDishToCart (state, { id }) {
    state.added.push({
      id,
      quantity: 1
    })
  },

  deleteDishFromCart (state, {id}) {
    function indexOf (arr, id) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
          return i
        }
      }
      return -1
    }
    state.added.splice(indexOf(state.added, id))
  },

  incrementItemQuantity (state, { id }) {
    const cartItem = state.added.find(item => item.id === id)
    cartItem.quantity++
  },

  decrementItemQuantity (state, { id }) {
    const cartItem = state.added.find(item => item.id === id)
    cartItem.quantity--
  },

  setCartItems (state, { items }) {
    state.added = items
  },

  setCheckoutStatus (state, status) {
    state.checkoutStatus = status
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

# Identity mapping function.
#
# @param v [Object] a value.
# @return [Object] v itself.
identity = (v) ->
  v


# Comparing given two objects.
#
# @param lhs [Object] an object.
# @param rhs [Object] another object.
# @return [Boolean] true if lhs is rhs otherwise false.
eq = (lhs, rhs) ->
  lhs is rhs


# Insert an item to a database if the item does not exist.
#
# @param db [nosql.Database] Database.
# @param item [Object] An item checked existence.
# @param comp [Function] Cmparing function which receives a document stored in
#   the database and the argument *item*. (Default: eq)
# @return [Promise] Promise object invoked with item inserted.  If no item was
#   inserted, the Promise object will be fulfilled with nothing.
insert_if_not_exists = (db, item, comp=eq) ->
  new Promise (resolve) ->
    db.one (doc) ->
      if comp doc, item then doc else null
    , (err, selected) ->
      if not selected?
        db.insert item, ->
          resolve item
      else
        resolve()


# Check an item exists in a database.
#
# @param db [nosql.Database] Database.
# @param item [Object] An item checked existence.
# @param comp [Function] Cmparing function which receives a document stored in
#   the database and the argument *item*. (Default: eq)
# @return [Promise] Promise object will be fulfilled with true if the item
#   exists in the database otherwise false.
exists = (db, item, comp=eq) ->
  new Promise (resolve) ->
    db.one (doc) ->
      if comp doc, item then doc else null
    , (err, selected) ->
      resolve selected?


# Pop an item from a database.
#
# @param db [nosql.Database] Database.
# @return [Promise] Promise object will be fulfilled with an item. If there are
#   no items, it will be rejected.
pop = (db) ->
  new Promise (resolve, reject) ->
    db.one identity, (err, selected) ->
      if selected?
        db.remove eq.bind(undefined, selected), ->
          resolve selected
      else
        reject()


module.exports =
  identity: identity
  eq: eq
  insert_if_not_exists: insert_if_not_exists
  exists: exists
  pop: pop

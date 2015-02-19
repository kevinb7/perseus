/** @jsx React.DOM */

var React = require('react');
var Util = require("./util.js");

var SearchAndReplaceDialog = React.createClass({

    propTypes: {
        onChange: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            replaceString: ""
        };
    },

    updateSearchString: function(event) {
        var searchIndex = 0;
        var searchString = event.target.value;
        this.props.onChange({ searchString, searchIndex });
    },

    updateReplaceString: function(event) {
        this.setState({ replaceString: event.target.value });
    },

    handleNextSearchResult: function() {
        var searchIndex = this.props.searchIndex;
        searchIndex++;
        searchIndex = searchIndex % this.props.searchResultCount;

        this.props.onChange({ searchIndex });
    },

    handlePreviousSearchResult: function() {
        var searchIndex = this.props.searchIndex;
        searchIndex--;
        if (searchIndex < 0) {
            searchIndex = this.props.searchResultCount - 1;
        }

        this.props.onChange({ searchIndex });
    },

    handleReplaceAll: function() {
        var replaceString = this.state.replaceString;
        var { question, searchString, hints, json } = this.props;

        var replaceCallback = () => replaceString;

        question = this._replaceFunc(question, searchString, replaceCallback);
        hints = this._replaceFunc(hints, searchString, replaceCallback);
        json = this._replaceFunc(json, searchString, replaceCallback);

        var state = { question, hints, json, searchIndex: 0 };
        this.props.onChange(state);
    },

    handleReplace: function() {
        var replaceString = this.state.replaceString;
        var { searchIndex, searchString, question, hints, json } =
            this.props;

        var regex = new RegExp(Util.escapeRegExp(searchString), "g");
        var globalIndex = 0;

        var replaceCallback = (match) => {
            return globalIndex++ === searchIndex ? replaceString : match;
        };

        question = this._replaceFunc(question, searchString, replaceCallback);
        hints = this._replaceFunc(hints, searchString, replaceCallback);
        json = this._replaceFunc(json, searchString, replaceCallback);

        // Adjust the search result count based on whether or not replaceString
        // contains the searchString one or more times.  This avoids having to
        // count the occurrences.  The thing is were not really saving much
        // time because ArticleEditor, EditorPage, and other components call
        // countEditorOccurrences in their render methods anyways.
        var matches = replaceString.match(regex);
        var matchCount = matches ? matches.length : 0;
        var searchResultCount = this.props.searchResultCount + matchCount - 1;
        if (searchIndex >= searchResultCount) {
            searchIndex = searchResultCount - 1;
        }

        this.props.onChange({ question, hints, json, searchIndex });
    },

    /**
     * Replaces each occurrence of searchString in obj.content with the result
     * of callback(occurrence).  If obj is an array then the same is done for
     * each item in the array.
     * @param obj
     * @param searchString
     * @param callback
     * @returns {*}
     * @private
     */
    _replaceFunc: function(obj, searchString, callback) {
        var regex = new RegExp(Util.escapeRegExp(searchString), "g");

        if (obj) {
            if (Array.isArray(obj)) {
                return obj.map(item => {
                    return this._replaceFunc(item, searchString, callback);
                });
            } else {
                // excludes occurrences within widget references
                var indices =
                    Util.getEditorIndicesOf(obj.content, searchString);
                var content =
                    obj.content.replace(regex, (match, offset) => {
                        // skip matches that are widget references
                        if (indices.indexOf(offset) !== -1) {
                            return callback(match);
                        } else {
                            return match;
                        }
                    });
                return _.extend({}, obj, { content });
            }
        } else {
            return obj;
        }
    },

    render: function() {
        var displayCount = this.props.searchResultCount;
        var disabled = displayCount === 0;

        var displayIndex = this.props.searchIndex + 1;
        if (displayIndex > displayCount) {
            displayIndex = displayCount;
        }

        var gridSpace = 8;

        var style = {
            padding: 10,
            position: 'fixed',
            right: 0,
            top: 0,
            width: 300,
            backgroundColor: '#EEE',
            border: 'solid 1px #DDD',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'row'
        };

        var labelStyle = {
            display: 'inline-block',
            textAlign: 'right',
            width: 60,
            marginRight: gridSpace
        };

        var inputStyle = {
            display: 'inline-block',
            width: '100%',
            boxSizing: 'border-box'
        };

        return <div style={style}>
            <div style={{ flexShrink: 0, flexGrow: 0 }}>
                <div>
                    <label style={labelStyle}>Search:</label>
                </div>
                <div>
                    <label style={labelStyle}>Replace:</label>
                </div>
                <span
                    ref="currentOfTotal"
                    style={labelStyle}>{displayIndex} of {displayCount}</span>
            </div>
            <div style={{ flexShrink: 0, flexGrow: 1 }}>
                <div>
                    <input
                        ref="searchInput"
                        type="text"
                        value={this.props.searchString}
                        onChange={this.updateSearchString}
                        style={inputStyle} />
                </div>
                <div>
                    <input
                        ref="replaceInput"
                        type="text"
                        value={this.props.replaceString}
                        onChange={this.updateReplaceString}
                        style={inputStyle} />
                </div>
                <div>
                    <button type="button"
                        ref="previousButton"
                        style={{ float: 'left', marginRight: gridSpace }}
                        onClick={this.handlePreviousSearchResult}
                        disabled={disabled}>&lt;</button>
                    <button type="button"
                        ref="nextButton"
                        style={{ float: 'left'}}
                        onClick={this.handleNextSearchResult}
                        disabled={disabled}>&gt;</button>

                    <button type="button"
                        ref="replaceAllButton"
                        style={{ float: 'right', marginLeft: gridSpace }}
                        onClick={this.handleReplaceAll}
                        disabled={disabled}>Replace All</button>
                    <button type="button"
                        ref="replaceButton"
                        style={{ float: 'right' }}
                        onClick={this.handleReplace}
                        disabled={disabled}>Replace</button>
                </div>
            </div>
        </div>;
    }

});

module.exports = SearchAndReplaceDialog;

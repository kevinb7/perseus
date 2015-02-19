var assert = require("assert");
var StatefulEditorPage = require("../stateful-editor-page.jsx");
var EditorPage = require("../editor-page.jsx");
var ArticleEditor = require("../article-editor.jsx");

var itemJson = require("./test-items/search-and-replace-item.json");
var particleJson = require("./test-items/search-and-replace-particle.json");
var Simulate = React.addons.TestUtils.Simulate;

describe("Search and Replace", function() {
    var statefulEditor, editorProps, dialog;
    var searchInput, replaceInput;
    var previousButton, nextButton, replaceButton, replaceAllButton;
    var currentOfTotal;

    beforeEach(function () {
        var problemNum = Math.floor(Math.random() * 100);
        var enabledFeatures = {
            highlight: true,
            toolTipFormats: true,
            useMathQuill: true
        };

        editorProps = {
            problemNum: problemNum,
            enabledFeatures: enabledFeatures,
            developerMode: true,
            imageUploader: function(image, callback) {
                _.delay(callback, 1000, "http://fake.image.url");
            }
        };
    });

    describe("EditorPage", function() {
        var question, hint;

        beforeEach(function() {
            editorProps = $.extend(true, editorProps, itemJson);
            editorProps.componentClass = EditorPage;

            statefulEditor = React.render(
                <StatefulEditorPage {...editorProps} />,
                document.body
            );

            var editor = statefulEditor.refs.editor;
            dialog = editor.refs.searchAndReplace;

            searchInput = dialog.refs.searchInput.getDOMNode();
            replaceInput = dialog.refs.replaceInput.getDOMNode();
            replaceButton = dialog.refs.replaceButton.getDOMNode();
            replaceAllButton = dialog.refs.replaceAllButton.getDOMNode();
            previousButton = dialog.refs.previousButton.getDOMNode();
            nextButton = dialog.refs.nextButton.getDOMNode();
            currentOfTotal = dialog.refs.currentOfTotal.getDOMNode();
        });

        afterEach(function (done) {
            React.unmountComponentAtNode(document.body);
            document.body.innerHTML = "";
            setTimeout(done);
        });

        // Note: occurrences of the searchString inside a widget reference
        // should not be modified

        it("should replace all instances of searchString", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "eqn"}});
            Simulate.click(replaceAllButton);

            assert.equal(statefulEditor.state.question.content,
                '[[☃ categorizer 1]] eqn [[☃ categorizer 2]] eqn');
            assert.equal(statefulEditor.state.hints[0].content,
                '[[☃ categorizer 1]] eqn');
            assert.equal($(currentOfTotal).text(), "0 of 0");
        });

        it("should replace the first instance of searchString", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "eqn"}});
            Simulate.click(replaceButton);

            assert.equal(statefulEditor.state.question.content,
                '[[☃ categorizer 1]] eqn [[☃ categorizer 2]] categorizer');
            assert.equal(statefulEditor.state.hints[0].content,
                '[[☃ categorizer 1]] categorizer');
            assert.equal($(currentOfTotal).text(), "1 of 2");
        });

        it("should replace the second instance of searchString", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "eqn"}});
            Simulate.click(nextButton);
            Simulate.click(replaceButton);

            assert.equal(statefulEditor.state.question.content,
                '[[☃ categorizer 1]] categorizer [[☃ categorizer 2]] eqn');
            assert.equal(statefulEditor.state.hints[0].content,
                '[[☃ categorizer 1]] categorizer');
            assert.equal($(currentOfTotal).text(), "2 of 2");
        });

        it("should replace the last two searchStrings", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "eqn"}});
            Simulate.click(nextButton);
            Simulate.click(nextButton);
            Simulate.click(replaceButton);
            Simulate.click(replaceButton);

            assert.equal(statefulEditor.state.question.content,
                '[[☃ categorizer 1]] categorizer [[☃ categorizer 2]] eqn');
            assert.equal(statefulEditor.state.hints[0].content,
                '[[☃ categorizer 1]] eqn');
            assert.equal($(currentOfTotal).text(), "1 of 1");
        });

        it("should replace a single occurrence with itself", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "categorizer"}});
            Simulate.click(replaceButton);

            question = statefulEditor.state.question.content;
            hint = statefulEditor.state.hints[0].content;

            var expectedQuestion = '[[☃ categorizer 1]] categorizer ' +
                '[[☃ categorizer 2]] categorizer';

            assert.equal(question, expectedQuestion);
            assert.equal(hint, '[[☃ categorizer 1]] categorizer');
            assert.equal($(currentOfTotal).text(), "1 of 3");
        });

        it("should replace a single occurrence with two", function() {
            Simulate.change(searchInput, {target: {value: "cat"}});
            Simulate.change(replaceInput, {target: {value: "cat cat "}});
            Simulate.click(nextButton);
            Simulate.click(nextButton);
            Simulate.click(replaceButton);

            question = statefulEditor.state.question.content;
            hint = statefulEditor.state.hints[0].content;

            var expectedQuestion = '[[☃ categorizer 1]] categorizer ' +
                '[[☃ categorizer 2]] categorizer';

            assert.equal(question, expectedQuestion);
            assert.equal(hint, '[[☃ categorizer 1]] cat cat egorizer');
            assert.equal($(currentOfTotal).text(), "3 of 4");
        });

        it("should replace all occurrences with itself", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "categorizer"}});
            Simulate.click(replaceButton);

            question = statefulEditor.state.question.content;
            hint = statefulEditor.state.hints[0].content;

            var expectedQuestion = '[[☃ categorizer 1]] categorizer ' +
                '[[☃ categorizer 2]] categorizer';

            assert.equal(question, expectedQuestion);
            assert.equal(hint, '[[☃ categorizer 1]] categorizer');
            assert.equal($(currentOfTotal).text(), "1 of 3");
        });

        it("should replace all occurrences with two", function() {
            Simulate.change(searchInput, {target: {value: "cat"}});
            Simulate.change(replaceInput, {target: {value: "cat cat "}});
            Simulate.click(replaceAllButton);

            var expectedQuestion = '[[☃ categorizer 1]] cat cat egorizer ' +
                '[[☃ categorizer 2]] cat cat egorizer';
            assert.equal(statefulEditor.state.question.content,
                expectedQuestion);
            assert.equal(statefulEditor.state.hints[0].content,
                '[[☃ categorizer 1]] cat cat egorizer');
            assert.equal($(currentOfTotal).text(), "1 of 6");
        });
    });

    describe("ArticleEditor", function() {
        var section1, section2;

        beforeEach(function() {
            editorProps = $.extend(true, editorProps, particleJson);
            editorProps.componentClass = ArticleEditor;

            statefulEditor = React.render(
                <StatefulEditorPage {...editorProps} />,
                document.body
            );

            var editor = statefulEditor.refs.editor;
            var dialog = editor.refs.searchAndReplace;

            searchInput = dialog.refs.searchInput.getDOMNode();
            replaceInput = dialog.refs.replaceInput.getDOMNode();
            replaceButton = dialog.refs.replaceButton.getDOMNode();
            replaceAllButton = dialog.refs.replaceAllButton.getDOMNode();
            previousButton = dialog.refs.previousButton.getDOMNode();
            nextButton = dialog.refs.nextButton.getDOMNode();
            currentOfTotal = dialog.refs.currentOfTotal.getDOMNode();
        });

        afterEach(function (done) {
            React.unmountComponentAtNode(document.body);
            document.body.innerHTML = "";
            setTimeout(done);
        });

        it("should replace all instances of searchString", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "eqn"}});
            Simulate.click(replaceAllButton);

            section1 = statefulEditor.state.json[0].content;
            section2 = statefulEditor.state.json[1].content;

            assert.equal(section1,
                '[[☃ categorizer 1]] eqn [[☃ categorizer 2]] eqn');
            assert.equal(section2, '[[☃ categorizer 1]] eqn');
            assert.equal($(currentOfTotal).text(), "0 of 0");
        });

        it("should replace the first instance of searchString", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "eqn"}});
            Simulate.click(replaceButton);

            section1 = statefulEditor.state.json[0].content;
            section2 = statefulEditor.state.json[1].content;

            assert.equal(section1,
                '[[☃ categorizer 1]] eqn [[☃ categorizer 2]] categorizer');
            assert.equal(section2, '[[☃ categorizer 1]] categorizer');
            assert.equal($(currentOfTotal).text(), "1 of 2");
        });

        it("should replace the second instance of searchString", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "eqn"}});
            Simulate.click(nextButton);
            Simulate.click(replaceButton);

            section1 = statefulEditor.state.json[0].content;
            section2 = statefulEditor.state.json[1].content;

            assert.equal(section1,
                '[[☃ categorizer 1]] categorizer [[☃ categorizer 2]] eqn');
            assert.equal(section2, '[[☃ categorizer 1]] categorizer');
            assert.equal($(currentOfTotal).text(), "2 of 2");
        });

        it("should replace the last two searchStrings", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "eqn"}});
            Simulate.click(nextButton);
            Simulate.click(nextButton);
            Simulate.click(replaceButton);
            Simulate.click(replaceButton);

            section1 = statefulEditor.state.json[0].content;
            section2 = statefulEditor.state.json[1].content;

            assert.equal(section1,
                '[[☃ categorizer 1]] categorizer [[☃ categorizer 2]] eqn');
            assert.equal(section2, '[[☃ categorizer 1]] eqn');
            assert.equal($(currentOfTotal).text(), "1 of 1");
        });


        it("should replace a single occurrence with itself", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "categorizer"}});
            Simulate.click(replaceButton);

            section1 = statefulEditor.state.json[0].content;
            section2 = statefulEditor.state.json[1].content;

            var expectedQuestion = '[[☃ categorizer 1]] categorizer ' +
                '[[☃ categorizer 2]] categorizer';

            assert.equal(section1, expectedQuestion);
            assert.equal(section2, '[[☃ categorizer 1]] categorizer');
            assert.equal($(currentOfTotal).text(), "1 of 3");
        });

        it("should replace a single occurrence with two", function() {
            Simulate.change(searchInput, {target: {value: "cat"}});
            Simulate.change(replaceInput, {target: {value: "cat cat "}});
            Simulate.click(nextButton);
            Simulate.click(nextButton);
            Simulate.click(replaceButton);

            section1 = statefulEditor.state.json[0].content;
            section2 = statefulEditor.state.json[1].content;

            var expectedSection1 = '[[☃ categorizer 1]] categorizer ' +
                '[[☃ categorizer 2]] categorizer';
            assert.equal(section1, expectedSection1);
            assert.equal(section2, '[[☃ categorizer 1]] cat cat egorizer');
            assert.equal($(currentOfTotal).text(), "3 of 4");
        });

        it("should replace all occurrences with itself", function() {
            Simulate.change(searchInput, {target: {value: "categorizer"}});
            Simulate.change(replaceInput, {target: {value: "categorizer"}});
            Simulate.click(replaceButton);

            section1 = statefulEditor.state.json[0].content;
            section2 = statefulEditor.state.json[1].content;

            var expectedSection1 = '[[☃ categorizer 1]] categorizer ' +
                '[[☃ categorizer 2]] categorizer';
            assert.equal(section1, expectedSection1);
            assert.equal(section2, '[[☃ categorizer 1]] categorizer');
            assert.equal($(currentOfTotal).text(), "1 of 3");
        });

        it("should replace all occurrences with two", function() {
            Simulate.change(searchInput, {target: {value: "cat"}});
            Simulate.change(replaceInput, {target: {value: "cat cat "}});
            Simulate.click(replaceAllButton);

            section1 = statefulEditor.state.json[0].content;
            section2 = statefulEditor.state.json[1].content;

            var expectedSection1 = '[[☃ categorizer 1]] cat cat egorizer ' +
                '[[☃ categorizer 2]] cat cat egorizer';
            assert.equal(section1, expectedSection1);
            assert.equal(section2, '[[☃ categorizer 1]] cat cat egorizer');
            assert.equal($(currentOfTotal).text(), "1 of 6");
        });
    });
});

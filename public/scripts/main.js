window.huge = window.huge || {};

(function (window, document, huge) {
  // just want to be fancy xD
  huge.author = {
    name: 'Jhonnatan Gonzalez R',
    mail: 'jhonnatanhxc@gmail.com'
  };

  // handle click or touch event
  huge.click = 'ontouchstart' in window ? 'touchend' : 'click';

  // Object to handle http requests
  huge.req = new XMLHttpRequest();

  // menu view
  huge.view = (function (req) {
    //  cache variables
    var data,
        $body = document.body,
        $mobileBtn = document.getElementById('mobile_btn'),
        $container = document.getElementById('mainNav'),
        $mainNav = document.createElement('ul'),
        $overlay = document.getElementById('overlay');

    $mainNav.className = 'nav_list clearfix';

    // private function creates a submenu
    function _createSubMenu(subMenu, $menuItem) {
      var $subMenu = document.createElement('ul');
      $subMenu.className = 'subnav_list';
      subMenu.forEach(function (item, index, array){
        var $subMenuItem = document.createElement('li'),
            $subMenuAnchor = document.createElement('a');
        $subMenuItem.className = 'subnav_item';
        $subMenuAnchor.className = 'subnav_anchor';
        // set the anchor
        $subMenuAnchor.innerHTML = item.label;
        $subMenuAnchor.setAttribute('href', item.url);
        // append childs
        $subMenuItem.appendChild($subMenuAnchor)
        $subMenu.appendChild($subMenuItem);

        // attatch the submenu
        $menuItem.appendChild($subMenu);
        // make sure the item has submenu items before reate a subenu
        // probably with this we can recursively create sub menu's if them exist
        if((typeof item.items !== null && typeof item.items !== 'undefined') && item.items.length > 0){
          $subMenuAcnhor.classList.add('subnav_anchor__hasDrop')
          _createSubMenu(item.items, $subMenuItem);
        }
      });
    }

    //  private function crate main menu
    function _createMenu(item, index, array) {
      var $mainNavItem = document.createElement('li'),
          $mainNavAcnhor = document.createElement('a');

      $mainNavItem.className = 'nav_item';
      $mainNavAcnhor.className = 'nav_anchor';
      // set the anchor
      $mainNavAcnhor.innerHTML = item.label;
      $mainNavAcnhor.setAttribute('href', item.url);
      // append childs
      $mainNavItem.appendChild($mainNavAcnhor)
      $mainNav.appendChild($mainNavItem);
      // make sure the item has submenu items before reate a subenu
      if((typeof item.items !== null && typeof item.items !== 'undefined') && item.items.length > 0){
        $mainNavAcnhor.classList.add('nav_anchor__hasDrop')
        _createSubMenu(item.items, $mainNavItem)
      }
    }

    // render this view
    function render() {
      data.items.forEach(_createMenu);
      // append the created menu
      $container.insertBefore($mainNav, $container.firstChild);
    }

    // toggle offsite nav on mobile
    function _toggleMenu() {
      if($body.classList.contains('nav__open')){
        $body.classList.remove('nav__open');
      }else{
        $body.classList.add('nav__open');
      }
    }

    // close Menu
    function _closeMenu() {
      $body.classList.remove('nav__open');
    }

    // close dropdowns that are opened
    function _closeDropDowns() {
      var $dropdowns = document.querySelectorAll('.subnav_list__show');
      for(var i = 0; i < $dropdowns.length; i++){
        $dropdowns[i].classList.remove('subnav_list__show');
      }      
    }

    // remove active status on anchors
    function _removeActive() {
      var $anchors = document.querySelectorAll('.nav_anchor');
      for(var i = 0; i < $anchors.length; i++){
        $anchors[i].classList.remove('nav_anchor__active');
      }       
    }

    function _showOverlay() {
      $overlay.classList.add('overlay__show');
    }

    function _hideOverlay() {
      $overlay.classList.remove('overlay__show');
    }    

    function _toggleDropDown(e) {
      // delegate event to anchors
      if(e.target.matches('.nav_anchor')){
        var $anchor = e.target;
        // toggle drop downs
        if($anchor.classList.contains('nav_anchor__hasDrop') || $anchor.classList.contains('subnav_anchor__hasDrop')){
          e.preventDefault();
          if($anchor.nextElementSibling.classList.contains('subnav_list__show')){
            _hideOverlay();
            $anchor.classList.remove('nav_anchor__active');
            $anchor.nextElementSibling.classList.remove('subnav_list__show');
          }
          else{
            _closeDropDowns();
            _removeActive();
            _showOverlay();
            $anchor.classList.add('nav_anchor__active');
            $anchor.nextElementSibling.classList.add('subnav_list__show'); 
          }
          return;
        }
        _closeDropDowns();
      }
    }

    // show/hide overlay if clicking outside
    function _detectClickOutside(e, elementClass, callback) {
      // debugger;
      var hasParent = false;
        for(var node = e.target; node != document.body; node = node.parentNode)
        {
          if(node.classList.contains('nav')){
            hasParent = true;
            break;
          }
        }
      if(!hasParent){
        _removeActive();
        _closeDropDowns();
        _hideOverlay();
        if(e.target.matches('.overlay') && $body.classList.contains('nav__open')){
          _closeMenu();
        }
      }
    }

    // bind the events for menu interaction
    function _bindEvents() {
      $mobileBtn.addEventListener(huge.click, _toggleMenu);
      $container.addEventListener(huge.click, _toggleDropDown);
      document.addEventListener(huge.click, _detectClickOutside);
    }

    function init() {
      req.open('GET', '/api/nav.json', true);
      req.onreadystatechange = function(){
        if(req.readyState === 4){
          if(req.status === 200){
            data = JSON.parse(req.responseText);
            // bind events and create markup
            render();
            _bindEvents();
          }else if (req.status === 400){
            console.log('error 400');
            data = null;
          }else{
            console.log('some different error');
            data = null;
          }
        }
      };
      req.send(null);
    }

    return {
      init: init,
      render: render
    };
  }(huge.req));

  // fnction to initialize other modules
  function init(){
    huge.view.init();
  }

  // init the main app
  init();

}(window, document, window.huge));
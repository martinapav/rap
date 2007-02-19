/*******************************************************************************
 * Copyright (c) 2002-2006 Innoopract Informationssysteme GmbH.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 * 
 * Contributors:
 *     Innoopract Informationssysteme GmbH - initial API and implementation
 ******************************************************************************/

/**
 * This class encapulates the qx.ui.treefullcontrol.Tree o make it more
 * suitable for usage in RWT.
 * The style parameter mimics the RWT style flag. Possible values (strings)
 * are: multi, check
 */
qx.OO.defineClass(
  "org.eclipse.rap.rwt.widgets.Tree", 
  qx.ui.treefullcontrol.Tree,
  function( style ) {
    var trs = qx.ui.treefullcontrol.TreeRowStructure.getInstance().standard( "" );
    qx.ui.treefullcontrol.Tree.call( this, trs );
    this.setOverflow( qx.constant.Style.OVERFLOW_AUTO );
    this.setHideNode( true );
    this.setUseTreeLines( true );
    this.setUseDoubleClick( true );
    // TODO [rh] this is only to make the tree fousable at all
    this.setTabIndex( 1 );
    this._rwtStyle = style;
    //
    this._widgetSelectedListeners = false;
    this._treeListeners = false; 
    var manager = this.getManager();
    manager.setMultiSelection( qx.lang.String.contains( style, "multi" ) );
    manager.addEventListener( "changeSelection", this._onWidgetSelected, this );
    this.addEventListener( "treeOpenWithContent", this._onItemExpanded, this );
    this.addEventListener( "treeClose", this._onItemCollapsed, this );
    this.addEventListener( "contextmenu", this._onContextMenu, this );
  }
);

/**
 * Are there any server-side SelectionListeners attached? If so, selecting an
 * item causes a request to be sent that informs the server-side listeners.
 */
qx.Proto.setWidgetSelectedListeners = function( value ) {
  this._widgetSelectedListeners = value;
}

qx.Proto.hasWidgetSelectedListeners = function() {
  return this._widgetSelectedListeners;
}

/**
 * Are there any server-side TreeListeners attached? If so, expanding/collapsing
 * an item causes a request to be sent that informs the server-side listeners.
 */
qx.Proto.setTreeListeners = function( value ) {
  this._treeListeners = value;  
}

qx.Proto.getRWTStyle = function() {
  return this._rwtStyle;  
}

qx.Proto.dispose = function() {
  if( this.getDisposed() ) {
    return true;
  }
  var manager = this.getManager();
  manager.removeEventListener( "changeSelection", this._onWidgetSelected, this );
  this.removeEventListener( "treeOpenWithContent", this._onItemExpanded, this );
  this.removeEventListener( "treeClose", this._onItemCollapsed, this );
  return qx.ui.treefullcontrol.Tree.prototype.dispose.call( this );
}

// TODO [rh] handle multi selection
qx.Proto._onWidgetSelected = function( evt ) {
  if( !org_eclipse_rap_rwt_EventUtil_suspend ) {
    var wm = org.eclipse.rap.rwt.WidgetManager.getInstance();
    var selectedItemIds = "";
    if( this.getManager().getMultiSelection() ) {
      var selectedItems = this.getManager().getSelectedItems();
      for( var i = 0; i < selectedItems.length; i++ ) {
        if( i > 0 ) {
          selectedItemIds += ",";
        }
        selectedItemIds += wm.findIdByWidget( selectedItems[ i ] );
      }
    } else {
      selectedItemIds = wm.findIdByWidget( this.getManager().getSelectedItem() );
    }
    var req = org.eclipse.rap.rwt.Request.getInstance();
    var id = wm.findIdByWidget( this );
    req.addParameter( id + ".selection", selectedItemIds );
    if( this._widgetSelectedListeners ) {
      var itemId = wm.findIdByWidget( this.getManager().getLeadItem() );
      org.eclipse.rap.rwt.EventUtil.doWidgetSelected( itemId, 0, 0, 0, 0 );
    }
  }
}

qx.Proto._onItemExpanded = function( evt ) {
  if( !org_eclipse_rap_rwt_EventUtil_suspend ) {
    var wm = org.eclipse.rap.rwt.WidgetManager.getInstance();
    var treeItemId = wm.findIdByWidget( evt.getData() );
    var req = org.eclipse.rap.rwt.Request.getInstance();
    req.addParameter( treeItemId + ".state", "expanded" );
    if( this._treeListeners ) {
      req.addEvent( "org.eclipse.rap.rwt.events.treeExpanded", treeItemId );
      req.send();
    }
  }
}

qx.Proto._onItemCollapsed = function( evt ) {
  if( !org_eclipse_rap_rwt_EventUtil_suspend ) {
    var wm = org.eclipse.rap.rwt.WidgetManager.getInstance();
    var treeItemId = wm.findIdByWidget( evt.getData() );
    var req = org.eclipse.rap.rwt.Request.getInstance();
    req.addParameter( treeItemId + ".state", "collapsed" );
    if( this._treeListeners ) {
      req.addEvent( "org.eclipse.rap.rwt.events.treeCollapsed", treeItemId );
      req.send();
    }
  }
}

qx.Proto._onContextMenu = function( evt ) {
  var menu = this.getContextMenu();
  if( menu != null ) {
    menu.setLocation( evt.getPageX(), evt.getPageY() );
    menu.setOpener( this );
    menu.show();
    evt.stopPropagation();
  }
}

/*
 * Pass enablement to tree items
 */
qx.Proto._modifyEnabled = function( propValue, propOldValue, propData ) {
  // TODO [rst] call super._modifyEnabled ?
  var items = this.getItems();
  for( var i = 0; i < items.length; i++ ) {
    var item = items[ i ];
    
    //--- hack from rh:
    if( item.getLabelObject() != null ) {
      var label = item.getLabelObject();
      label.setBackgroundColor( "red" );
      label.setEnabled( propValue );
    } else {
      // TODO [rh] revise this: how to remove/dispose of the listener?
      item.addEventListener( "appear", function( evt ) {
        this.getLabelObject().setEnabled( propValue );
      }, item );
    }
    //---
    
    item.setEnabled( propValue );
  }
  return true;
};
